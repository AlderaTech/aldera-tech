import { describe, it, expect, mock, beforeEach } from "bun:test";
import crypto from "node:crypto";

mock.module("server-only", () => ({}));

mock.module("next/cache", () => ({
  revalidatePath: mock(),
  revalidateTag: mock(),
}));

mock.module("@/lib/notifications", () => ({
  notify: mock(async () => ({ success: true })),
}));

import { getTestPrisma } from "@/lib/test-prisma";
const prisma = getTestPrisma();
mock.module("@/lib/prisma", () => ({
  prisma,
  default: prisma,
}));

const { POST } = await import("./route");

describe("AT-L8: app/api/webhooks/payment/route.ts test suite", () => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "dummy_midtrans_server_key";

  function generateSignature(orderId: string, statusCode: string, grossAmount: string): string {
    return crypto
      .createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");
  }

  describe("Validation & Integrity Checks", () => {
    it("returns 400 on malformed JSON payload", async () => {
      const req = new Request("http://localhost:3000/api/webhooks/payment", {
        method: "POST",
        body: "{malformed-json",
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid JSON body");
    });

    it("returns 400 on missing required webhook fields", async () => {
      const req = new Request("http://localhost:3000/api/webhooks/payment", {
        method: "POST",
        body: JSON.stringify({ order_id: "ORD-123" }), // missing transaction_status, signature_key, etc.
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("Payload webhook Midtrans tidak lengkap");
    });

    it("returns 401 when signature_key is invalid", async () => {
      const req = new Request("http://localhost:3000/api/webhooks/payment", {
        method: "POST",
        body: JSON.stringify({
          order_id: "ORD-TEST-1",
          status_code: "200",
          gross_amount: "100000.00",
          signature_key: "invalid_bogus_signature_hex",
          transaction_status: "settlement",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Signature Midtrans tidak valid");
    });

    it("returns 404 when referenced invoice does not exist", async () => {
      const orderId = `INV-NONEXISTENT-${Date.now()}`;
      const grossAmount = "150000.00";
      const sig = generateSignature(orderId, "200", grossAmount);

      const req = new Request("http://localhost:3000/api/webhooks/payment", {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          status_code: "200",
          gross_amount: grossAmount,
          signature_key: sig,
          transaction_status: "settlement",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain("tidak ditemukan");
    });

    it("returns 400 when gross_amount does not match invoice total", async () => {
      const stamp = Date.now();
      const client = await prisma.user.create({
        data: {
          email: `client_wh_${stamp}@aldera.test`,
          name: "Webhook Client",
          password: "hashed_dummy_password",
          roles: ["CLIENT"],
        },
      });

      const invoice = await prisma.invoice.create({
        data: {
          number: `INV-MISMATCH-${stamp}`,
          clientId: client.id,
          issueDate: new Date(),
          dueDate: new Date(),
          subtotal: 500000,
          total: 500000,
          status: "SENT",
        },
      });

      // Send webhook with different amount: 400000 instead of 500000
      const orderId = `${invoice.number}-${Date.now()}`;
      const wrongAmount = "400000.00";
      const sig = generateSignature(orderId, "200", wrongAmount);

      const req = new Request("http://localhost:3000/api/webhooks/payment", {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          status_code: "200",
          gross_amount: wrongAmount,
          signature_key: sig,
          transaction_status: "settlement",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Nominal pembayaran tidak sesuai dengan total tagihan");
    });
  });

  describe("Idempotency & Status Transitions", () => {
    it("transitions invoice to PAID and payment to SUCCESS upon settlement", async () => {
      const stamp = Date.now();
      const client = await prisma.user.create({
        data: {
          email: `client_settle_${stamp}@aldera.test`,
          name: "Settle Client",
          password: "hashed_dummy_password",
          roles: ["CLIENT"],
        },
      });

      const invoice = await prisma.invoice.create({
        data: {
          number: `INV-SETTLE-${stamp}`,
          clientId: client.id,
          issueDate: new Date(),
          dueDate: new Date(),
          subtotal: 750000,
          total: 750000,
          status: "SENT",
        },
      });

      const orderId = `${invoice.number}-${Date.now()}`;
      const grossAmount = "750000.00";
      const transactionId = `midtrans_tx_${stamp}`;
      const sig = generateSignature(orderId, "200", grossAmount);

      const req = new Request("http://localhost:3000/api/webhooks/payment", {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          status_code: "200",
          gross_amount: grossAmount,
          signature_key: sig,
          transaction_status: "settlement",
          transaction_id: transactionId,
          payment_type: "bank_transfer",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      // Verify DB: invoice marked PAID
      const updatedInv = await prisma.invoice.findUnique({
        where: { id: invoice.id },
        include: { payments: true },
      });
      expect(updatedInv?.status).toBe("PAID");
      expect(updatedInv?.paidAt).not.toBeNull();
      expect(updatedInv?.paymentMethod).toBe("GATEWAY_MIDTRANS");
      expect(updatedInv?.payments.length).toBe(1);
      expect(updatedInv?.payments[0].status).toBe("SUCCESS");
      expect(updatedInv?.payments[0].transactionId).toBe(transactionId);

      // Idempotency check: replay the exact same webhook request
      const replayReq = new Request("http://localhost:3000/api/webhooks/payment", {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          status_code: "200",
          gross_amount: grossAmount,
          signature_key: sig,
          transaction_status: "settlement",
          transaction_id: transactionId,
          payment_type: "bank_transfer",
        }),
      });

      const replayRes = await POST(replayReq);
      expect(replayRes.status).toBe(200);
      const replayJson = await replayRes.json();
      expect(replayJson.message).toBe("Already processed");
    });

    it("handles failure and expiry status transitions", async () => {
      const stamp = Date.now();
      const client = await prisma.user.create({
        data: {
          email: `client_fail_${stamp}@aldera.test`,
          name: "Fail Client",
          password: "hashed_dummy_password",
          roles: ["CLIENT"],
        },
      });

      const invoice = await prisma.invoice.create({
        data: {
          number: `INV-FAIL-${stamp}`,
          clientId: client.id,
          issueDate: new Date(),
          dueDate: new Date(Date.now() - 24 * 3600 * 1000), // due yesterday -> should become OVERDUE
          subtotal: 200000,
          total: 200000,
          status: "SENT",
        },
      });

      const orderId = `${invoice.number}-${Date.now()}`;
      const grossAmount = "200000.00";
      const sig = generateSignature(orderId, "200", grossAmount);

      const req = new Request("http://localhost:3000/api/webhooks/payment", {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          status_code: "200",
          gross_amount: grossAmount,
          signature_key: sig,
          transaction_status: "expire",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const payment = await prisma.payment.findFirst({
        where: { invoiceId: invoice.id },
      });
      expect(payment?.status).toBe("FAILED");
      expect(payment?.rejectionReason).toContain("Pembayaran expire via Midtrans");
    });
  });
});
