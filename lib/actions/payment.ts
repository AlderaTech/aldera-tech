"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createMidtransSnapTransaction } from "@/lib/midtrans";
import { revalidatePath } from "next/cache";
import { DASHBOARD_ROUTES, ADMIN_ROUTES } from "@/lib/routes";

export type PaymentSnapResult = {
  ok: boolean;
  message?: string;
  redirectUrl?: string;
  token?: string;
};

/**
 * Server action untuk menginisiasi sesi pembayaran tagihan menggunakan Midtrans Snap.
 * Menghasilkan token Snap dan tautan redirect pembayaran resmi dari Midtrans.
 */
export async function createInvoicePaymentSnapAction(
  invoiceId: string
): Promise<PaymentSnapResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, message: "Sesi tidak valid. Silakan login kembali." };
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
        items: true,
      },
    });

    if (!invoice) {
      return { ok: false, message: "Tagihan tidak ditemukan." };
    }

    // Otorisasi: Pemilik invoice atau Admin
    const isOwner = invoice.clientId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return {
        ok: false,
        message: "Anda tidak memiliki hak akses untuk membayar tagihan ini.",
      };
    }

    // Pengecekan status tagihan
    if (invoice.status === "PAID") {
      return { ok: false, message: "Tagihan ini sudah lunas." };
    }

    if (invoice.status === "CANCELLED") {
      return {
        ok: false,
        message: "Tagihan ini telah dibatalkan dan tidak dapat dibayar.",
      };
    }

    const grossAmount = Number(invoice.total);
    if (grossAmount <= 0) {
      return { ok: false, message: "Total tagihan tidak valid." };
    }

    // Siapkan detail customer
    const customerDetails = {
      firstName: invoice.client.name,
      email: invoice.client.email,
      phone: invoice.client.phone ?? undefined,
    };

    // Siapkan detail item
    const itemDetails = invoice.items.map((item) => ({
      id: item.id,
      name: item.description,
      price: Number(item.price),
      quantity: Number(item.quantity) || 1,
    }));

    // Generate Snap token dari Midtrans API
    const snapResult = await createMidtransSnapTransaction({
      orderId: invoice.number,
      grossAmount,
      customer: customerDetails,
      items: itemDetails,
    });

    // Catat record payment berstatus PENDING
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.total,
        currency: invoice.currency,
        status: "PENDING",
        paymentMethod: "GATEWAY_MIDTRANS",
        gateway: "midtrans",
        transactionId: snapResult.token,
        paymentType: "snap",
        notes: "Menunggu pembayaran via Midtrans Snap",
        gatewayResponse: {
          token: snapResult.token,
          redirectUrl: snapResult.redirectUrl,
          createdAt: new Date().toISOString(),
        },
      },
    });

    revalidatePath(DASHBOARD_ROUTES.invoices);
    revalidatePath(ADMIN_ROUTES.invoiceDetail(invoice.id));

    return {
      ok: true,
      token: snapResult.token,
      redirectUrl: snapResult.redirectUrl,
    };
  } catch (error: unknown) {
    console.error("Gagal membuat sesi pembayaran Midtrans:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat memproses pembayaran dengan Midtrans.";

    return {
      ok: false,
      message: errorMessage,
    };
  }
}
