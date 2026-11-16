import type { InvoiceStatus } from "@prisma/client";

export function invoicePaymentError(status: InvoiceStatus): string | null {
  if (status === "SENT" || status === "OVERDUE") return null;
  if (status === "PAID") return "Tagihan ini sudah lunas.";
  if (status === "CANCELLED")
    return "Tagihan ini telah dibatalkan dan tidak dapat dibayar.";
  if (status === "PENDING_VERIFICATION")
    return "Bukti pembayaran sedang diverifikasi. Silakan tunggu hasilnya.";
  return "Tagihan belum diterbitkan dan belum dapat dibayar.";
}
