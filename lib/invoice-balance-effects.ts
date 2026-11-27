import { Prisma, type BalanceEffectKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { transactionRouter } from "@/lib/router-db";

/** Persist with the payment; a router credit must never run inside a primary transaction. */
export async function queueInvoiceBalanceEffect(
  tx: Prisma.TransactionClient,
  invoice: {
    id: string;
    purpose: string;
    total: Prisma.Decimal;
    currency?: string;
  },
  kind: BalanceEffectKind
) {
  if (invoice.purpose !== "AI_RELAY_TOPUP") return;
  if (!invoice.total.isPositive())
    throw new Error("Nominal top-up tidak valid.");
  if (invoice.currency && invoice.currency !== "IDR")
    throw new Error("Saldo AI hanya mendukung Rupiah.");
  await tx.invoiceBalanceEffect.upsert({
    where: { invoiceId_kind: { invoiceId: invoice.id, kind } },
    create: { invoiceId: invoice.id, kind, amount: invoice.total },
    update: {},
  });
}

export async function applyInvoiceBalanceEffect(id: string) {
  const effect = await prisma.invoiceBalanceEffect.findUniqueOrThrow({
    where: { id },
    include: { invoice: { include: { client: true } } },
  });
  if (effect.status === "APPLIED") return effect.status;
  try {
    const status = await transactionRouter(async (client) => {
      const { invoice } = effect;
      await client.query(
        `INSERT INTO users (web_user_id, full_name, username, balance, is_active)
         VALUES ($1, $2, $3, 0, true) ON CONFLICT (web_user_id) DO NOTHING`,
        [invoice.clientId, invoice.client.name, invoice.client.email]
      );
      const user = (
        await client.query<{ id: number; balance: string }>(
          "SELECT id, balance FROM users WHERE web_user_id = $1 FOR UPDATE",
          [invoice.clientId]
        )
      ).rows[0];
      if (!user) throw new Error("Akun saldo tidak ditemukan.");
      const applied = await client.query(
        "SELECT id FROM balance_transactions WHERE user_id = $1 AND reference_id = $2",
        [user.id, effect.id]
      );
      if (applied.rows.length) return "APPLIED" as const;
      if (effect.kind === "REFUND") {
        const credit = await prisma.invoiceBalanceEffect.findUnique({
          where: {
            invoiceId_kind: { invoiceId: invoice.id, kind: "CREDIT" },
          },
        });
        if (!credit || credit.status !== "APPLIED")
          throw new Error("Kredit awal belum direkonsiliasi.");
      }
      const before = new Prisma.Decimal(user.balance);
      const delta =
        effect.kind === "CREDIT" ? effect.amount : effect.amount.negated();
      const after = before.add(delta);
      if (after.isNegative()) {
        await client.query(
          "UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1",
          [user.id]
        );
        return "REVIEW" as const;
      }
      await client.query(
        "UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2",
        [after.toFixed(4), user.id]
      );
      await client.query(
        `INSERT INTO balance_transactions
         (user_id, amount, transaction_type, reference_id, balance_before, balance_after, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.id,
          delta.toFixed(4),
          effect.kind === "CREDIT" ? "topup" : "manual_adjust",
          effect.id,
          before.toFixed(4),
          after.toFixed(4),
          `${effect.kind}: invoice ${invoice.number}`,
        ]
      );
      return "APPLIED" as const;
    });
    await prisma.invoiceBalanceEffect.update({
      where: { id },
      data: {
        status,
        attempts: { increment: 1 },
        appliedAt: status === "APPLIED" ? new Date() : null,
        lastError:
          status === "REVIEW"
            ? "Saldo refund tidak cukup. Akses AI diblokir; perlu tinjauan admin."
            : null,
      },
    });
    return status;
  } catch (error) {
    await prisma.invoiceBalanceEffect.update({
      where: { id },
      data: {
        attempts: { increment: 1 },
        lastError: "Rekonsiliasi tertunda. Coba ulang melalui panel admin.",
      },
    });
    throw error;
  }
}

export async function processInvoiceBalanceEffects(invoiceId?: string) {
  const effects = await prisma.invoiceBalanceEffect.findMany({
    where: { invoiceId, status: "PENDING" },
    orderBy: [{ createdAt: "asc" }, { kind: "asc" }],
    take: 100,
  });
  for (const effect of effects) await applyInvoiceBalanceEffect(effect.id);
}
