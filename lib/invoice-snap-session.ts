import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { invoicePaymentError } from "@/lib/invoice-payment-policy";
import type { SnapTransactionResult } from "@/lib/midtrans";

const invoiceInclude = {
  client: { select: { name: true, email: true, phone: true } },
  items: true,
} satisfies Prisma.InvoiceInclude;
type SnapInvoice = Prisma.InvoiceGetPayload<{ include: typeof invoiceInclude }>;
export type SnapReservation = {
  kind: "reserved";
  invoice: SnapInvoice;
  paymentId: string;
  orderId: string;
};
type ReservationResult =
  | SnapReservation
  | { kind: "error"; message: string }
  | ({ kind: "existing" } & SnapTransactionResult);
const SESSION_REUSE_MS = 5 * 60_000;
const CREATION_LEASE_MS = 2 * 60_000;

function object(value: Prisma.JsonValue | null): Prisma.JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

/** Reserve under a row lock; network requests stay outside the transaction. */
export async function reserveInvoiceSnap(
  invoiceId: string,
  user: { id: string; role?: string }
): Promise<ReservationResult> {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Invoice" WHERE "id" = ${invoiceId} FOR UPDATE`;
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: invoiceInclude,
    });
    if (!invoice) return { kind: "error", message: "Tagihan tidak ditemukan." };
    if (invoice.clientId !== user.id && user.role !== "ADMIN")
      return {
        kind: "error",
        message: "Anda tidak memiliki hak akses untuk membayar tagihan ini.",
      };
    const message = invoicePaymentError(invoice.status);
    if (message) return { kind: "error", message };
    if (!invoice.total.isPositive())
      return { kind: "error", message: "Total tagihan tidak valid." };
    const pending = await tx.payment.findFirst({
      where: { invoiceId, status: "PENDING", gateway: "midtrans" },
      orderBy: { createdAt: "desc" },
    });
    const response = object(pending?.gatewayResponse ?? null);
    const age =
      typeof response.createdAt === "string"
        ? Date.now() - Date.parse(response.createdAt)
        : Infinity;
    if (
      pending &&
      age >= 0 &&
      age < CREATION_LEASE_MS &&
      response.state === "CREATING"
    )
      return {
        kind: "error",
        message:
          "Sesi pembayaran sedang disiapkan. Silakan coba kembali sebentar lagi.",
      };
    if (
      pending &&
      age >= 0 &&
      age < SESSION_REUSE_MS &&
      response.invoiceVersion === invoice.updatedAt.toISOString() &&
      pending.amount.equals(invoice.total) &&
      pending.currency === invoice.currency &&
      typeof response.token === "string" &&
      typeof response.redirectUrl === "string"
    )
      return {
        kind: "existing",
        token: response.token,
        redirectUrl: response.redirectUrl,
      };
    // A response from an expired attempt must not become payable after its retry.
    if (pending && response.state === "CREATING") {
      await tx.payment.updateMany({
        where: { id: pending.id, status: "PENDING", transactionId: null },
        data: {
          status: "FAILED",
          notes: "Reservasi kedaluwarsa dan digantikan percobaan baru.",
        },
      });
    }
    // The numeric suffix preserves the existing webhook invoice resolver.
    const orderId = `${invoice.number}-${Date.now()}${String(randomInt(100_000_000)).padStart(8, "0")}`;
    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amount: invoice.total,
        currency: invoice.currency,
        status: "PENDING",
        gateway: "midtrans",
        paymentMethod: "GATEWAY_MIDTRANS",
        paymentType: "snap",
        notes: "Menyiapkan sesi pembayaran Midtrans Snap",
        gatewayResponse: {
          state: "CREATING",
          orderId,
          createdAt: new Date().toISOString(),
        },
      },
    });
    return { kind: "reserved", invoice, paymentId: payment.id, orderId };
  });
}

export async function failInvoiceSnap(paymentId: string) {
  await prisma.payment.updateMany({
    where: { id: paymentId, status: "PENDING", transactionId: null },
    data: {
      status: "FAILED",
      notes: "Sesi tidak tersedia. Silakan buat sesi pembayaran baru.",
    },
  });
}

export async function finalizeInvoiceSnap(
  reservation: SnapReservation,
  result: SnapTransactionResult
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const { invoice, paymentId, orderId } = reservation;
    await tx.$queryRaw`SELECT "id" FROM "Invoice" WHERE "id" = ${invoice.id} FOR UPDATE`;
    const current = await tx.invoice.findUnique({ where: { id: invoice.id } });
    const valid =
      current &&
      !invoicePaymentError(current.status) &&
      current.updatedAt.getTime() === invoice.updatedAt.getTime() &&
      current.clientId === invoice.clientId &&
      current.total.equals(invoice.total) &&
      current.currency === invoice.currency;
    if (!valid) {
      await tx.payment.updateMany({
        where: { id: paymentId, status: "PENDING", transactionId: null },
        data: {
          status: "FAILED",
          notes: "Status atau rincian tagihan berubah selama pembuatan sesi.",
        },
      });
      return false;
    }
    const saved = await tx.payment.updateMany({
      where: { id: paymentId, status: "PENDING", transactionId: null },
      data: {
        transactionId: result.token,
        notes: "Menunggu pembayaran via Midtrans Snap",
        gatewayResponse: {
          token: result.token,
          redirectUrl: result.redirectUrl,
          orderId,
          invoiceVersion: invoice.updatedAt.toISOString(),
          createdAt: new Date().toISOString(),
        },
      },
    });
    return saved.count === 1;
  });
}
