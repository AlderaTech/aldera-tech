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

mock.module("@/lib/whatsapp", () => ({
  sendWhatsApp: mock(async () => ({ success: true })),
}));

mock.module("@/lib/notifications", () => ({
  notify: mock(async () => ({ success: true })),
}));

const {
  createInvoiceAction,
  submitPaymentProofAction,
  verifyPaymentProofAction,
  rejectPaymentProofAction,
} = await import("@/lib/actions/invoice");
const { prisma } = await import("@/lib/prisma");

describe("AT-L3: lib/actions/invoice.ts test suite", () => {
  const adminId = "admin_inv_tester_1";
  let clientUser: { id: string; email: string };

  beforeEach(async () => {
    await prisma.user.upsert({
      where: { id: adminId },
      create: {
        id: adminId,
        email: "admin.inv@aldera.test",
        name: "Admin Tester",
        password: "hashed_dummy_password",
        roles: ["ADMIN"],
      },
      update: {},
    });

    currentSession = {
      user: {
        id: adminId,
        role: "ADMIN",
        roles: ["ADMIN"],
        name: "Admin Tester",
        email: "admin.inv@aldera.test",
      },
    };

    const stamp = Date.now();
    clientUser = await prisma.user.create({
      data: {
        email: `inv_client_${stamp}@aldera.test`,
        name: "Invoice Client",
        password: "hashed_dummy_password",
        roles: ["CLIENT"],
      },
    });
  });

  describe("createInvoiceAction & Sequential Numbering", () => {
    it("throws Forbidden if user is not ADMIN", async () => {
      currentSession = {
        user: {
          id: clientUser.id,
          role: "CLIENT",
          roles: ["CLIENT"],
          name: "Client",
          email: clientUser.email,
        },
      };

      const formData = new FormData();
      expect(createInvoiceAction({ ok: false }, formData)).rejects.toThrow("Forbidden");
    });

    it("creates invoice with sequential number INV-YYYY-XXXX and calculates totals", async () => {
      const year = new Date().getFullYear();

      // Invoice 1
      const formData1 = new FormData();
      formData1.set("clientId", clientUser.id);
      formData1.set("issueDate", "2026-11-01");
      formData1.set("dueDate", "2026-11-15");
      formData1.set("taxRate", "11");
      formData1.set("notes", "First test invoice");
      formData1.set(
        "items",
        JSON.stringify([
          { description: "Landing Page Development", quantity: 1, price: 10000000 },
          { description: "Hosting & Domain (1 Year)", quantity: 2, price: 500000 },
        ])
      );

      const res1 = await createInvoiceAction({ ok: false }, formData1);
      expect(res1.ok).toBe(true);
      expect(res1.invoiceId).toBeDefined();

      const inv1 = await prisma.invoice.findUnique({
        where: { id: res1.invoiceId },
        include: { items: true },
      });
      expect(inv1).not.toBeNull();
      expect(inv1?.number).toMatch(new RegExp(`^INV-${year}-\\d{4}$`));
      // Subtotal = 10,000,000 + 1,000,000 = 11,000,000
      // Tax (11%) = 1,210,000
      // Total = 12,210,000
      expect(Number(inv1?.subtotal)).toBe(11000000);
      expect(Number(inv1?.taxAmount)).toBe(1210000);
      expect(Number(inv1?.total)).toBe(12210000);
      expect(inv1?.items.length).toBe(2);

      // Invoice 2: sequence must increment by 1
      const formData2 = new FormData();
      formData2.set("clientId", clientUser.id);
      formData2.set("issueDate", "2026-11-01");
      formData2.set("dueDate", "2026-11-15");
      formData2.set("taxRate", "0");
      formData2.set(
        "items",
        JSON.stringify([{ description: "Maintenance", quantity: 1, price: 500000 }])
      );

      const res2 = await createInvoiceAction({ ok: false }, formData2);
      expect(res2.ok).toBe(true);

      const inv2 = await prisma.invoice.findUnique({ where: { id: res2.invoiceId } });
      const seq1 = parseInt(inv1!.number.split("-")[2], 10);
      const seq2 = parseInt(inv2!.number.split("-")[2], 10);
      expect(seq2).toBe(seq1 + 1);
    });
  });

  describe("submitPaymentProofAction", () => {
    it("rejects unauthorized submission by a different client", async () => {
      const stamp = Date.now();
      const otherClient = await prisma.user.create({
        data: {
          email: `other_${stamp}@aldera.test`,
          name: "Other Client",
          password: "hashed_dummy_password",
          roles: ["CLIENT"],
        },
      });

      const inv = await prisma.invoice.create({
        data: {
          number: `INV-TEST-${stamp}`,
          clientId: clientUser.id,
          issueDate: new Date(),
          dueDate: new Date(),
          subtotal: 100000,
          total: 100000,
          status: "SENT",
        },
      });

      // Session as other client
      currentSession = {
        user: {
          id: otherClient.id,
          role: "CLIENT",
          roles: ["CLIENT"],
          name: "Other",
          email: otherClient.email,
        },
      };

      const res = await submitPaymentProofAction({
        invoiceId: inv.id,
        proofUrl: "https://example.com/proof.jpg",
      });
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Anda tidak memiliki akses ke invoice ini.");
    });

    it("rejects payment proof on DRAFT or PAID invoices", async () => {
      const stamp = Date.now();
      const draftInv = await prisma.invoice.create({
        data: {
          number: `INV-DRAFT-${stamp}`,
          clientId: clientUser.id,
          issueDate: new Date(),
          dueDate: new Date(),
          subtotal: 100000,
          total: 100000,
          status: "DRAFT",
        },
      });

      currentSession = {
        user: {
          id: clientUser.id,
          role: "CLIENT",
          roles: ["CLIENT"],
          name: "Client",
          email: clientUser.email,
        },
      };

      const resDraft = await submitPaymentProofAction({
        invoiceId: draftInv.id,
        proofUrl: "https://example.com/proof.jpg",
      });
      expect(resDraft.ok).toBe(false);
      expect(resDraft.message).toContain("draf tidak dapat dibayar");

      await prisma.invoice.update({
        where: { id: draftInv.id },
        data: { status: "PAID" },
      });

      const resPaid = await submitPaymentProofAction({
        invoiceId: draftInv.id,
        proofUrl: "https://example.com/proof.jpg",
      });
      expect(resPaid.ok).toBe(false);
      expect(resPaid.message).toContain("sudah lunas");
    });

    it("submits proof successfully and transitions to PENDING_VERIFICATION", async () => {
      const stamp = Date.now();
      const inv = await prisma.invoice.create({
        data: {
          number: `INV-VALID-${stamp}`,
          clientId: clientUser.id,
          issueDate: new Date(),
          dueDate: new Date(),
          subtotal: 500000,
          total: 500000,
          status: "SENT",
        },
      });

      currentSession = {
        user: {
          id: clientUser.id,
          role: "CLIENT",
          roles: ["CLIENT"],
          name: "Client",
          email: clientUser.email,
        },
      };

      const res = await submitPaymentProofAction({
        invoiceId: inv.id,
        proofUrl: "/uploads/proof123.jpg",
        notes: "Bank BCA transfer",
      });

      expect(res.ok).toBe(true);

      const updatedInv = await prisma.invoice.findUnique({
        where: { id: inv.id },
        include: { payments: true },
      });
      expect(updatedInv?.status).toBe("PENDING_VERIFICATION");
      expect(updatedInv?.paymentProofUrl).toBe("/uploads/proof123.jpg");
      expect(updatedInv?.payments.length).toBe(1);
      expect(updatedInv?.payments[0].status).toBe("PENDING");
      expect(updatedInv?.payments[0].proofUrl).toBe("/uploads/proof123.jpg");
    });
  });

  describe("verifyPaymentProofAction & rejectPaymentProofAction", () => {
    it("verifies payment proof and transitions invoice to PAID and payment to SUCCESS", async () => {
      const stamp = Date.now();
      const inv = await prisma.invoice.create({
        data: {
          number: `INV-VERIFY-${stamp}`,
          clientId: clientUser.id,
          issueDate: new Date(),
          dueDate: new Date(),
          subtotal: 250000,
          total: 250000,
          status: "PENDING_VERIFICATION",
          paymentProofUrl: "/uploads/verify.jpg",
          payments: {
            create: {
              amount: 250000,
              currency: "IDR",
              status: "PENDING",
              paymentMethod: "MANUAL_TRANSFER",
              proofUrl: "/uploads/verify.jpg",
            },
          },
        },
      });

      // Admin executes verification
      currentSession = {
        user: {
          id: adminId,
          role: "ADMIN",
          roles: ["ADMIN"],
          name: "Admin",
          email: "admin@aldera.test",
        },
      };

      const res = await verifyPaymentProofAction(inv.id);
      expect(res.ok).toBe(true);

      const updated = await prisma.invoice.findUnique({
        where: { id: inv.id },
        include: { payments: true },
      });
      expect(updated?.status).toBe("PAID");
      expect(updated?.paidAt).not.toBeNull();
      expect(updated?.payments[0].status).toBe("SUCCESS");
      expect(updated?.payments[0].verifiedById).toBe(adminId);
    });

    it("rejects payment proof and sets invoice back to UNPAID/OVERDUE and payment to FAILED", async () => {
      const stamp = Date.now();
      const inv = await prisma.invoice.create({
        data: {
          number: `INV-REJECT-${stamp}`,
          clientId: clientUser.id,
          issueDate: new Date(),
          dueDate: new Date(),
          subtotal: 250000,
          total: 250000,
          status: "PENDING_VERIFICATION",
          paymentProofUrl: "/uploads/reject.jpg",
          payments: {
            create: {
              amount: 250000,
              currency: "IDR",
              status: "PENDING",
              paymentMethod: "MANUAL_TRANSFER",
              proofUrl: "/uploads/reject.jpg",
            },
          },
        },
      });

      const res = await rejectPaymentProofAction(inv.id, "Struk tidak terbaca atau buram");
      expect(res.ok).toBe(true);

      const updated = await prisma.invoice.findUnique({
        where: { id: inv.id },
        include: { payments: true },
      });
      expect(updated?.status).not.toBe("PENDING_VERIFICATION");
      expect(updated?.paymentProofUrl).toBeNull();
      expect(updated?.payments[0].status).toBe("FAILED");
    });
  });
});
