import { Prisma, type InvoiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  queueInvoiceBalanceEffect,
  processInvoiceBalanceEffects,
} from "@/lib/invoice-balance-effects";

export async function transitionInvoiceStatus(
  tx: Prisma.TransactionClient,
  id: string,
  status: InvoiceStatus,
  actorId: string
) {
  await tx.$queryRaw`SELECT "id" FROM "Invoice" WHERE "id" = ${id} FOR UPDATE`;
  const invoice = await tx.invoice.findUniqueOrThrow({ where: { id } });
  if (invoice.status === status) return invoice;
  if (
    invoice.status === "PAID" ||
    (await tx.payment.count({ where: { invoiceId: id, status: "REFUNDED" } }))
  )
    throw new Error(
      "Pembayaran final harus direkonsiliasi melalui alur pembayaran/refund."
    );
  if (status === "PAID") {
    if (invoice.status === "CANCELLED")
      throw new Error("Invoice dibatalkan tidak dapat ditandai lunas.");
    const pending = await tx.payment.findFirst({
      where: { invoiceId: id, status: "PENDING" },
    });
    const data = {
      status: "SUCCESS" as const,
      verifiedAt: new Date(),
      verifiedById: actorId,
      gateway: "manual",
      paymentMethod: "MANUAL_TRANSFER" as const,
      notes: "Pelunasan dicatat secara eksplisit oleh admin.",
    };
    if (pending) await tx.payment.update({ where: { id: pending.id }, data });
    else
      await tx.payment.create({
        data: {
          ...data,
          invoiceId: id,
          amount: invoice.total,
          currency: invoice.currency,
        },
      });
    await queueInvoiceBalanceEffect(tx, invoice, "CREDIT");
    await tx.auditLog.create({
      data: {
        userId: actorId,
        action: "INVOICE_PAID",
        entityType: "Invoice",
        entityId: id,
      },
    });
  }
  return tx.invoice.update({
    where: { id },
    data: { status, paidAt: status === "PAID" ? new Date() : null },
  });
}

export async function changeInvoiceStatus(
  ids: string[],
  status: InvoiceStatus,
  actorId: string
) {
  if (
    ![
      "DRAFT",
      "SENT",
      "PENDING_VERIFICATION",
      "PAID",
      "OVERDUE",
      "CANCELLED",
    ].includes(status)
  )
    throw new Error("Status tidak valid.");
  const result = await prisma.$transaction(async (tx) => {
    const invoices = [];
    for (const id of [...new Set(ids)].sort())
      invoices.push(await transitionInvoiceStatus(tx, id, status, actorId));
    return invoices;
  });
  for (const invoice of result) await processInvoiceBalanceEffects(invoice.id);
  return result;
}
