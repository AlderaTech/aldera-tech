"use server";

import { auth } from "@/auth";
import { createMidtransSnapTransaction } from "@/lib/midtrans";
import { revalidatePath } from "next/cache";
import { DASHBOARD_ROUTES, ADMIN_ROUTES } from "@/lib/routes";
import {
  reserveInvoiceSnap,
  finalizeInvoiceSnap,
  failInvoiceSnap,
} from "@/lib/invoice-snap-session";
import { invoiceSnapItems } from "@/lib/invoice-snap-items";

export type PaymentSnapResult = {
  ok: boolean;
  message?: string;
  redirectUrl?: string;
  token?: string;
};

export async function createInvoicePaymentSnapAction(
  invoiceId: string
): Promise<PaymentSnapResult> {
  let reservationId: string | undefined;
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { ok: false, message: "Sesi tidak valid. Silakan login kembali." };
    const reservation = await reserveInvoiceSnap(invoiceId, session.user);
    if (reservation.kind === "error")
      return { ok: false, message: reservation.message };
    if (reservation.kind === "existing")
      return {
        ok: true,
        token: reservation.token,
        redirectUrl: reservation.redirectUrl,
      };
    reservationId = reservation.paymentId;
    const { invoice } = reservation;
    const result = await createMidtransSnapTransaction({
      orderId: reservation.orderId,
      grossAmount: Math.round(Number(invoice.total)),
      customer: {
        firstName: invoice.client.name,
        email: invoice.client.email,
        phone: invoice.client.phone ?? undefined,
      },
      items: invoiceSnapItems(invoice),
    });
    if (!(await finalizeInvoiceSnap(reservation, result)))
      return {
        ok: false,
        message:
          "Status tagihan telah berubah. Silakan muat ulang sebelum membayar.",
      };
    revalidatePath(DASHBOARD_ROUTES.invoices);
    revalidatePath(ADMIN_ROUTES.invoiceDetail(invoice.id));
    return { ok: true, token: result.token, redirectUrl: result.redirectUrl };
  } catch {
    console.error("Pembuatan sesi pembayaran Midtrans gagal.");
    if (reservationId) {
      try {
        await failInvoiceSnap(reservationId);
      } catch {
        console.error("Pembersihan reservasi pembayaran tertunda.");
      }
    }
    return {
      ok: false,
      message: "Sesi pembayaran belum dapat dibuat. Silakan coba kembali.",
    };
  }
}
