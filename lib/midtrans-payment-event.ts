import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { MidtransPaymentState } from "@/lib/midtrans";
import { queueInvoiceBalanceEffect } from "@/lib/invoice-balance-effects";

export async function recordMidtransEvent(input: {
  invoiceId: string;
  transactionId: string;
  paymentType: string;
  state: MidtransPaymentState;
  payload: Prisma.InputJsonObject;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Invoice" WHERE "id" = ${input.invoiceId} FOR UPDATE`;
    const invoice = await tx.invoice.findUniqueOrThrow({
      where: { id: input.invoiceId },
    });
    const payment = await tx.payment.findFirst({
      where: { transactionId: input.transactionId },
    });
    if (payment && payment.invoiceId !== invoice.id)
      throw new Error("Transaksi milik invoice lain.");
    if (
      payment?.status === "REFUNDED" ||
      (invoice.status === "PAID" && input.state !== "REFUNDED") ||
      (payment?.status === "SUCCESS" && input.state !== "REFUNDED")
    )
      return false;
    if (input.state === "UNKNOWN") return false;
    if (
      input.state !== "REFUNDED" &&
      (await tx.payment.count({
        where: { invoiceId: invoice.id, status: "REFUNDED" },
      }))
    )
      return false;
    if (input.state === "REFUNDED" && payment?.status !== "SUCCESS")
      throw new Error(
        "Refund belum memiliki transaksi pembayaran sukses yang sesuai."
      );
    const pending =
      payment ??
      (await tx.payment.findFirst({
        where: {
          invoiceId: invoice.id,
          status: "PENDING",
          gateway: "midtrans",
        },
        orderBy: { createdAt: "desc" },
      }));
    const data = {
      status: input.state,
      transactionId: input.transactionId,
      ...(input.state === "FAILED"
        ? {
            rejectionReason: `Pembayaran ${String(input.payload.transaction_status)} via Midtrans`,
          }
        : {}),
      paymentType: input.paymentType,
      gatewayResponse: input.payload,
    };
    if (pending) await tx.payment.update({ where: { id: pending.id }, data });
    else
      await tx.payment.create({
        data: {
          ...data,
          invoiceId: invoice.id,
          amount: invoice.total,
          currency: invoice.currency,
          paymentMethod: "GATEWAY_MIDTRANS",
          gateway: "midtrans",
        },
      });
    if (input.state === "SUCCESS" || input.state === "REFUNDED") {
      const refunded = input.state === "REFUNDED";
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: refunded ? "CANCELLED" : "PAID",
          paidAt: refunded ? null : new Date(),
          paymentMethod: "GATEWAY_MIDTRANS",
        },
      });
      await queueInvoiceBalanceEffect(
        tx,
        invoice,
        refunded ? "REFUND" : "CREDIT"
      );
      if (invoice.projectId)
        await tx.activityLog.create({
          data: {
            projectId: invoice.projectId,
            userId: invoice.clientId,
            action: refunded ? "PROJECT_UPDATED" : "INVOICE_PAID",
            description: `Invoice ${invoice.number}: ${refunded ? "pembayaran direfund penuh" : "pembayaran diterima"} melalui Midtrans.`,
          },
        });
    }
    return true;
  });
}
