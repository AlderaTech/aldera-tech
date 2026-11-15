import { describe, it, expect, mock, spyOn } from "bun:test";
import type { Prisma } from "@prisma/client";
import { getTestPrisma } from "@/lib/test-prisma";
import { queryRouter, getRouterPool } from "@/lib/router-db";
const prisma = getTestPrisma();
let failAcknowledgement = false;
let failCommit = false;
const actionPrisma = new Proxy(prisma, {
  get(target, key) {
    if (key === "$transaction" && failCommit)
      return async (
        callback: (tx: Prisma.TransactionClient) => Promise<unknown>
      ) =>
        prisma.$transaction(async (tx) => {
          await callback(tx);
          throw new Error("commit failure");
        });
    if (key === "invoiceBalanceEffect" && failAcknowledgement)
      return {
        ...target.invoiceBalanceEffect,
        update: async () => {
          failAcknowledgement = false;
          throw new Error("ack unavailable");
        },
      };
    return Reflect.get(target, key);
  },
});
mock.module("@/lib/prisma", () => ({
  prisma: actionPrisma,
  default: actionPrisma,
}));
const { recordMidtransEvent } = await import("./midtrans-payment-event");
const {
  applyInvoiceBalanceEffect,
  processInvoiceBalanceEffects,
  queueInvoiceBalanceEffect,
} = await import("./invoice-balance-effects");
const { transitionInvoiceStatus } = await import("./invoice-status-transition");
const { nextDocumentNumber } = await import("./document-number");
const { issueDueRecurringInvoices, advanceBillingDate } =
  await import("./recurring-invoice-issuer");

async function invoice(
  purpose: "PROJECT" | "AI_RELAY_TOPUP" = "AI_RELAY_TOPUP"
) {
  const id = crypto.randomUUID();
  const client = await prisma.user.create({
    data: {
      email: `${id}@effects.test`,
      name: "Effect fixture",
      password: "fake",
    },
  });
  return prisma.invoice.create({
    data: {
      number: id,
      clientId: client.id,
      purpose,
      status: "SENT",
      issueDate: new Date(),
      dueDate: new Date(),
      total: 100000,
      subtotal: 100000,
      notes: "topup saldo described in project text",
    },
  });
}
async function event(id: string, state: "SUCCESS" | "REFUNDED") {
  return recordMidtransEvent({
    invoiceId: id,
    transactionId: `transaction-${id}`,
    paymentType: "bank_transfer",
    state,
    payload: {
      transaction_status: state === "SUCCESS" ? "settlement" : "refund",
    },
  });
}
describe("Durable payments and invoice issuance", () => {
  it("uses numeric document sequences beyond 9999", async () => {
    const inv = await invoice("PROJECT");
    await prisma.invoice.createMany({
      data: ["9999", "10000"].map((sequence) => ({
        number: `INV-2040-${sequence}`,
        clientId: inv.clientId,
        issueDate: new Date(),
        dueDate: new Date(),
        subtotal: 1,
        total: 1,
      })),
    });
    const number = await prisma.$transaction((tx) =>
      nextDocumentNumber(tx, "invoice", new Date("2040-01-01T00:00:00Z"))
    );
    expect(number).toBe("INV-2040-10001");
  });
  it("rolls back invoice and recurring schedule together if commit fails", async () => {
    const inv = await invoice("PROJECT"),
      now = new Date("2031-11-16T00:00:00Z");
    const template = await prisma.recurringInvoiceTemplate.create({
      data: {
        name: "Rollback",
        clientId: inv.clientId,
        frequency: "MONTHLY",
        nextIssueDate: now,
        dueDays: 14,
        items: [{ description: "Service", quantity: 1, price: 1000 }],
      },
    });
    failCommit = true;
    try {
      await expect(issueDueRecurringInvoices(now)).rejects.toThrow(
        "commit failure"
      );
    } finally {
      failCommit = false;
    }
    expect(
      await prisma.invoice.count({
        where: { recurringTemplateId: template.id },
      })
    ).toBe(0);
    expect(
      (
        await prisma.recurringInvoiceTemplate.findUniqueOrThrow({
          where: { id: template.id },
        })
      ).nextIssueDate
    ).toEqual(now);
    await issueDueRecurringInvoices(now);
    expect(
      await prisma.invoice.count({
        where: { recurringTemplateId: template.id },
      })
    ).toBe(1);
  });
  it("never credits a project invoice based on free text", async () => {
    const inv = await invoice("PROJECT");
    await event(inv.id, "SUCCESS");
    await processInvoiceBalanceEffects(inv.id);
    expect(
      await prisma.invoiceBalanceEffect.count({ where: { invoiceId: inv.id } })
    ).toBe(0);
    expect(
      (
        await queryRouter("SELECT id FROM users WHERE web_user_id=$1", [
          inv.clientId,
        ])
      ).rows
    ).toHaveLength(0);
  });
  it("rolls back the outbox with a failed primary transaction", async () => {
    const inv = await invoice();
    await expect(
      prisma.$transaction(async (tx) => {
        await queueInvoiceBalanceEffect(tx, inv, "CREDIT");
        throw new Error("rollback");
      })
    ).rejects.toThrow("rollback");
    expect(
      await prisma.invoiceBalanceEffect.count({ where: { invoiceId: inv.id } })
    ).toBe(0);
  });
  it("serializes settlement/refund retries and keeps ledger append-only", async () => {
    const inv = await invoice();
    await Promise.all([event(inv.id, "SUCCESS"), event(inv.id, "SUCCESS")]);
    const credit = await prisma.invoiceBalanceEffect.findFirstOrThrow({
      where: { invoiceId: inv.id, kind: "CREDIT" },
    });
    await Promise.all([
      applyInvoiceBalanceEffect(credit.id),
      applyInvoiceBalanceEffect(credit.id),
    ]);
    expect(
      (
        await queryRouter<{ balance: string }>(
          "SELECT balance FROM users WHERE web_user_id=$1",
          [inv.clientId]
        )
      ).rows[0].balance
    ).toBe("100000.0000");
    await event(inv.id, "REFUNDED");
    await processInvoiceBalanceEffects(inv.id);
    await event(inv.id, "SUCCESS");
    const saved = await prisma.invoice.findUniqueOrThrow({
      where: { id: inv.id },
    });
    expect(saved.status).toBe("CANCELLED");
    expect(saved.paidAt).toBeNull();
    expect(
      (
        await queryRouter<{ balance: string }>(
          "SELECT balance FROM users WHERE web_user_id=$1",
          [inv.clientId]
        )
      ).rows[0].balance
    ).toBe("0.0000");
    expect(
      await prisma.payment.count({
        where: { invoiceId: inv.id, status: "REFUNDED" },
      })
    ).toBe(1);
  });
  it("recovers a router commit whose primary acknowledgement failed without double credit", async () => {
    const inv = await invoice();
    await event(inv.id, "SUCCESS");
    const effect = await prisma.invoiceBalanceEffect.findFirstOrThrow({
      where: { invoiceId: inv.id },
    });
    failAcknowledgement = true;
    try {
      await expect(applyInvoiceBalanceEffect(effect.id)).rejects.toThrow(
        "ack unavailable"
      );
    } finally {
      failAcknowledgement = false;
    }
    await applyInvoiceBalanceEffect(effect.id);
    expect(
      (
        await queryRouter<{ n: string }>(
          "SELECT count(*) AS n FROM balance_transactions WHERE reference_id=$1",
          [effect.id]
        )
      ).rows[0].n
    ).toBe("1");
  });
  it("leaves an effect pending on router failure and applies it on retry", async () => {
    const inv = await invoice();
    await event(inv.id, "SUCCESS");
    const effect = await prisma.invoiceBalanceEffect.findFirstOrThrow({
      where: { invoiceId: inv.id },
    });
    const fail = spyOn(getRouterPool(), "connect").mockRejectedValueOnce(
      new Error("router unavailable")
    );
    try {
      await expect(applyInvoiceBalanceEffect(effect.id)).rejects.toThrow();
    } finally {
      fail.mockRestore();
    }
    expect(
      (
        await prisma.invoiceBalanceEffect.findUniqueOrThrow({
          where: { id: effect.id },
        })
      ).status
    ).toBe("PENDING");
    await applyInvoiceBalanceEffect(effect.id);
    expect(
      (
        await prisma.invoiceBalanceEffect.findUniqueOrThrow({
          where: { id: effect.id },
        })
      ).status
    ).toBe("APPLIED");
  });
  it("blocks AI access for an unaffordable refund and records review without negative balances", async () => {
    const inv = await invoice();
    await event(inv.id, "SUCCESS");
    await processInvoiceBalanceEffects(inv.id);
    const user = (
      await queryRouter<{ id: number }>(
        "SELECT id FROM users WHERE web_user_id=$1",
        [inv.clientId]
      )
    ).rows[0];
    await queryRouter("UPDATE users SET balance=20000 WHERE id=$1", [user.id]);
    await queryRouter(
      "INSERT INTO balance_transactions (user_id,amount,transaction_type,reference_id,balance_before,balance_after) VALUES ($1,-80000,'manual_adjust',$2,100000,20000)",
      [user.id, crypto.randomUUID()]
    );
    await event(inv.id, "REFUNDED");
    await processInvoiceBalanceEffects(inv.id);
    const effect = await prisma.invoiceBalanceEffect.findFirstOrThrow({
      where: { invoiceId: inv.id, kind: "REFUND" },
    });
    expect(effect.status).toBe("REVIEW");
    const saved = (
      await queryRouter<{ balance: string; is_active: boolean }>(
        "SELECT balance,is_active FROM users WHERE id=$1",
        [user.id]
      )
    ).rows[0];
    expect(saved.balance).toBe("20000.0000");
    expect(saved.is_active).toBe(false);
  });
  it("manual PAID status writes an auditable Payment once and rejects silent rollback", async () => {
    const inv = await invoice("PROJECT");
    await Promise.all(
      [1, 2].map(() =>
        prisma.$transaction((tx) =>
          transitionInvoiceStatus(tx, inv.id, "PAID", inv.clientId)
        )
      )
    );
    expect(
      await prisma.payment.count({
        where: { invoiceId: inv.id, status: "SUCCESS" },
      })
    ).toBe(1);
    await expect(
      prisma.$transaction((tx) =>
        transitionInvoiceStatus(tx, inv.id, "SENT", inv.clientId)
      )
    ).rejects.toThrow("rekonsiliasi");
  });
  it("issues a recurring period once during concurrent cron runs and clamps month end", async () => {
    const inv = await invoice("PROJECT");
    const now = new Date("2032-01-31T08:00:00Z");
    const template = await prisma.recurringInvoiceTemplate.create({
      data: {
        name: "Recurring regression",
        clientId: inv.clientId,
        frequency: "MONTHLY",
        nextIssueDate: now,
        dueDays: 14,
        items: [{ description: "Subscription", quantity: 1, price: 10000 }],
      },
    });
    await Promise.all([
      issueDueRecurringInvoices(now),
      issueDueRecurringInvoices(now),
    ]);
    expect(
      await prisma.invoice.count({
        where: { recurringTemplateId: template.id },
      })
    ).toBe(1);
    expect(
      (
        await prisma.recurringInvoiceTemplate.findUniqueOrThrow({
          where: { id: template.id },
        })
      ).nextIssueDate.toISOString()
    ).toBe("2032-02-29T08:00:00.000Z");
    expect(
      advanceBillingDate(
        new Date("2031-01-31T08:00:00Z"),
        "MONTHLY"
      ).toISOString()
    ).toBe("2031-02-28T08:00:00.000Z");
  });
});
