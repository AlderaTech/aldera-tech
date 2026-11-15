import { describe, expect, it, mock } from "bun:test";
import type { InvoiceStatus } from "@prisma/client";
import { getTestPrisma } from "@/lib/test-prisma";
const prisma = getTestPrisma();
mock.module("@/lib/prisma", () => ({ prisma, default: prisma }));
const { verifyManualPayment } = await import("./manual-payment-verification");

async function fixture(
  status: InvoiceStatus = "PENDING_VERIFICATION",
  proof: string | null = "/uploads/fixture.pdf"
) {
  const user = await prisma.user.create({
    data: {
      email: `${crypto.randomUUID()}@example.invalid`,
      name: "Payment Fixture",
      password: "not-a-real-password",
      roles: ["ADMIN"],
    },
  });
  const invoice = await prisma.invoice.create({
    data: {
      number: `FIXTURE-${crypto.randomUUID()}`,
      clientId: user.id,
      issueDate: new Date(),
      dueDate: new Date(),
      subtotal: 100000,
      total: 100000,
      status,
      paymentProofUrl: proof,
      payments: {
        create: {
          amount: 100000,
          status: "PENDING",
          paymentMethod: "MANUAL_TRANSFER",
        },
      },
    },
  });
  return { user, invoice };
}

describe("Manual invoice verification idempotency", () => {
  for (const concurrent of [false, true]) {
    it(`records one successful payment for ${concurrent ? "concurrent" : "sequential"} retries`, async () => {
      const { user, invoice } = await fixture();
      const run = () => verifyManualPayment(invoice.id, user.id);
      const results = concurrent
        ? await Promise.all([run(), run()])
        : [await run(), await run()];
      expect(results.every((result) => result.ok)).toBe(true);
      expect(
        results.filter((result) => result.ok && result.changed)
      ).toHaveLength(1);
      const payments = await prisma.payment.findMany({
        where: { invoiceId: invoice.id, status: "SUCCESS" },
      });
      expect(payments).toHaveLength(1);
      expect(Number(payments[0].amount)).toBe(100000);
      expect(
        (await prisma.invoice.findUniqueOrThrow({ where: { id: invoice.id } }))
          .status
      ).toBe("PAID");
    });
  }
  it("does not approve draft, cancelled, or unsubmitted invoices", async () => {
    for (const status of ["DRAFT", "CANCELLED", "SENT"] as const) {
      const { user, invoice } = await fixture(status);
      expect((await verifyManualPayment(invoice.id, user.id)).ok).toBe(false);
      expect(
        await prisma.payment.count({
          where: { invoiceId: invoice.id, status: "SUCCESS" },
        })
      ).toBe(0);
    }
    const { user, invoice } = await fixture("PENDING_VERIFICATION", null);
    expect((await verifyManualPayment(invoice.id, user.id)).ok).toBe(false);
  });
  it("returns an explicit missing-invoice result", async () => {
    expect((await verifyManualPayment("missing-fixture", "fixture")).ok).toBe(
      false
    );
  });
  it("rolls back invoice status if payment persistence fails", async () => {
    const { invoice } = await fixture();
    await expect(
      verifyManualPayment(invoice.id, "nonexistent-verifier")
    ).rejects.toThrow();
    expect(
      (await prisma.invoice.findUniqueOrThrow({ where: { id: invoice.id } }))
        .status
    ).toBe("PENDING_VERIFICATION");
    expect(
      await prisma.payment.count({
        where: { invoiceId: invoice.id, status: "SUCCESS" },
      })
    ).toBe(0);
  });
});
