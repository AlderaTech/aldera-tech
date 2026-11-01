import { describe, it, expect, mock, beforeEach } from "bun:test";
import type { Role } from "@prisma/client";

type MockSession = {
  user: {
    id: string;
    roles?: Role[];
    role?: Role;
    name?: string;
    email?: string;
  };
} | null;

let currentSession: MockSession = null;

mock.module("server-only", () => ({}));

mock.module("@/auth", () => ({
  auth: mock(async () => currentSession),
  handlers: {},
  signIn: mock(),
  signOut: mock(),
}));

mock.module("next/cache", () => ({
  revalidatePath: mock(),
  revalidateTag: mock(),
}));

import { getTestPrisma } from "@/lib/test-prisma";
const prisma = getTestPrisma();
mock.module("@/lib/prisma", () => ({
  prisma,
  default: prisma,
}));

const mockCreateMidtransSnapTransaction = mock();

mock.module("@/lib/midtrans", () => ({
  createMidtransSnapTransaction: mockCreateMidtransSnapTransaction,
}));

const { createInvoicePaymentSnapAction } = await import("@/lib/actions/payment");

describe("AT-L4: lib/actions/payment.ts test suite", () => {
  let clientUser: { id: string; email: string };

  beforeEach(async () => {
    mockCreateMidtransSnapTransaction.mockReset();

    const stamp = Date.now();
    clientUser = await prisma.user.create({
      data: {
        email: `snap_client_${stamp}@aldera.test`,
        name: "Snap Client",
        password: "hashed_dummy_password",
        roles: ["CLIENT"],
      },
    });

    currentSession = {
      user: {
        id: clientUser.id,
        role: "CLIENT",
        roles: ["CLIENT"],
        name: "Snap Client",
        email: clientUser.email,
      },
    };
  });

  describe("Authentication & Authorization Gates", () => {
    it("returns error if session is missing", async () => {
      currentSession = null;
      const res = await createInvoicePaymentSnapAction("non_existent_id");
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Sesi tidak valid. Silakan login kembali.");
    });

    it("returns error if invoice is not found", async () => {
      const res = await createInvoicePaymentSnapAction("missing_inv_id_123");
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Tagihan tidak ditemukan.");
    });

    it("rejects user who is neither owner nor admin", async () => {
      const stamp = Date.now();
      const otherUser = await prisma.user.create({
        data: {
          email: `other_snap_${stamp}@aldera.test`,
          name: "Other User",
          password: "hashed_dummy_password",
          roles: ["CLIENT"],
        },
      });

      const inv = await prisma.invoice.create({
        data: {
          number: `INV-SNAP-${stamp}`,
          clientId: otherUser.id,
          issueDate: new Date(),
          dueDate: new Date(),
          subtotal: 100000,
          total: 100000,
          status: "SENT",
        },
      });

      const res = await createInvoicePaymentSnapAction(inv.id);
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Anda tidak memiliki hak akses untuk membayar tagihan ini.");
    });

    it("rejects payment if invoice is already PAID or CANCELLED", async () => {
      const stamp = Date.now();
      const inv = await prisma.invoice.create({
        data: {
          number: `INV-PAID-${stamp}`,
          clientId: clientUser.id,
          issueDate: new Date(),
          dueDate: new Date(),
          subtotal: 100000,
          total: 100000,
          status: "PAID",
        },
      });

      const resPaid = await createInvoicePaymentSnapAction(inv.id);
      expect(resPaid.ok).toBe(false);
      expect(resPaid.message).toBe("Tagihan ini sudah lunas.");

      await prisma.invoice.update({
        where: { id: inv.id },
        data: { status: "CANCELLED" },
      });

      const resCancel = await createInvoicePaymentSnapAction(inv.id);
      expect(resCancel.ok).toBe(false);
      expect(resCancel.message).toContain("telah dibatalkan");
    });
  });

  describe("Snap Session Creation & Rounding Adjustment", () => {
    it("creates Midtrans Snap session with rounding adjustment and creates Payment record", async () => {
      const stamp = Date.now();
      // Invoice with fractional subtotal and tax to verify rounding adjustment
      const inv = await prisma.invoice.create({
        data: {
          number: `INV-ROUND-${stamp}`,
          clientId: clientUser.id,
          issueDate: new Date(),
          dueDate: new Date(),
          subtotal: 99999.50,
          taxRate: 11,
          taxAmount: 10999.945,
          total: 110999.445,
          status: "SENT",
          items: {
            create: [
              { description: "Product A", quantity: 1, price: 50000, total: 50000, order: 0 },
              { description: "Product B", quantity: 1, price: 49999.50, total: 49999.50, order: 1 },
            ],
          },
        },
      });

      const mockToken = "snap-token-xyz-12345";
      const mockRedirectUrl = "https://app.midtrans.com/snap/v2/vtweb/snap-token-xyz-12345";
      mockCreateMidtransSnapTransaction.mockResolvedValueOnce({
        token: mockToken,
        redirectUrl: mockRedirectUrl,
      });

      const res = await createInvoicePaymentSnapAction(inv.id);
      expect(res.ok).toBe(true);
      expect(res.token).toBe(mockToken);
      expect(res.redirectUrl).toBe(mockRedirectUrl);

      // Verify createMidtransSnapTransaction arguments
      expect(mockCreateMidtransSnapTransaction).toHaveBeenCalled();
      const snapCallArgs = mockCreateMidtransSnapTransaction.mock.calls[0][0];
      const targetGross = snapCallArgs.grossAmount;
      const itemsSum = snapCallArgs.items.reduce(
        (sum: number, it: { price: number; quantity: number }) => sum + it.price * it.quantity,
        0
      );
      expect(itemsSum).toBe(targetGross);

      // Verify Payment record in database
      const payment = await prisma.payment.findFirst({
        where: { invoiceId: inv.id, status: "PENDING" },
      });
      expect(payment).not.toBeNull();
      expect(payment?.gateway).toBe("midtrans");
      expect(payment?.transactionId).toBe(mockToken);
      expect(payment?.paymentType).toBe("snap");
    });
  });
});
