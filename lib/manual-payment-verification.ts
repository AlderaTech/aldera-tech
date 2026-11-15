import type { Invoice } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

type VerifiedInvoice = Pick<
  Invoice,
  | "id"
  | "number"
  | "status"
  | "total"
  | "currency"
  | "paymentProofUrl"
  | "projectId"
  | "clientId"
>;
type VerificationResult =
  | { ok: false; message: string }
  | { ok: true; changed: boolean; invoice: VerifiedInvoice };

/** The conditional invoice update serializes approvals with other payment writers. */
export async function verifyManualPayment(
  invoiceId: string,
  adminId: string
): Promise<VerificationResult> {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        number: true,
        status: true,
        total: true,
        currency: true,
        paymentProofUrl: true,
        projectId: true,
        clientId: true,
      },
    });
    if (!invoice) return { ok: false, message: "Invoice tidak ditemukan." };
    if (invoice.status === "PAID") return { ok: true, changed: false, invoice };
    if (invoice.status !== "PENDING_VERIFICATION" || !invoice.paymentProofUrl)
      return {
        ok: false,
        message:
          "Invoice tidak memiliki bukti pembayaran yang menunggu verifikasi.",
      };

    const claimed = await tx.invoice.updateMany({
      where: {
        id: invoiceId,
        status: "PENDING_VERIFICATION",
        paymentProofUrl: { not: null },
      },
      data: { status: "PAID", paidAt: new Date() },
    });
    if (!claimed.count) {
      const current = await tx.invoice.findUnique({
        where: { id: invoiceId },
        select: { status: true },
      });
      if (current?.status === "PAID")
        return { ok: true, changed: false, invoice };
      return {
        ok: false,
        message: "Status invoice telah berubah. Silakan muat ulang.",
      };
    }
    const pendingPayment = await tx.payment.findFirst({
      where: { invoiceId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    if (pendingPayment) {
      await tx.payment.update({
        where: { id: pendingPayment.id },
        data: {
          status: "SUCCESS",
          verifiedAt: new Date(),
          verifiedById: adminId,
        },
      });
    } else {
      await tx.payment.create({
        data: {
          invoiceId,
          amount: invoice.total,
          currency: invoice.currency,
          status: "SUCCESS",
          paymentMethod: "MANUAL_TRANSFER",
          gateway: "manual",
          proofUrl: invoice.paymentProofUrl,
          verifiedAt: new Date(),
          verifiedById: adminId,
        },
      });
    }
    if (invoice.projectId) {
      await tx.activityLog.create({
        data: {
          projectId: invoice.projectId,
          userId: adminId,
          action: "INVOICE_PAID",
          description: `Pembayaran invoice ${invoice.number} senilai ${formatCurrency(Number(invoice.total))} telah diverifikasi lunas.`,
          metadata: {
            invoiceId,
            invoiceNumber: invoice.number,
            amount: Number(invoice.total),
          },
        },
      });
    }
    return { ok: true, changed: true, invoice };
  });
}
