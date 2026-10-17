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

    // Siapkan detail item dengan kuantitas bulat integer dan harga bulat
    const itemDetails = invoice.items.map((item) => ({
      id: item.id,
      name: item.description.slice(0, 50),
      price: Math.round(Number(item.total)),
      quantity: 1,
    }));

    // Sertakan item pajak jika invoice.taxAmount > 0
    if (Number(invoice.taxAmount) > 0) {
      itemDetails.push({
        id: "TAX",
        price: Math.round(Number(invoice.taxAmount)),
        quantity: 1,
        name: `Pajak (${invoice.taxRate}%)`,
      });
    }

    const targetTotal = Math.round(Number(invoice.total));
    if (targetTotal <= 0) {
      return { ok: false, message: "Total tagihan tidak valid." };
    }

    // Pastikan sum(item_details) === gross_amount
    const itemsSum = itemDetails.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const diff = targetTotal - itemsSum;
    if (diff !== 0 && itemDetails.length > 0) {
      itemDetails[itemDetails.length - 1].price += diff;
    }
    const grossAmount = targetTotal;

    // Siapkan detail customer
    const customerDetails = {
      firstName: invoice.client.name,
      email: invoice.client.email,
      phone: invoice.client.phone ?? undefined,
    };

    // Generate unique timestamped orderId
    const orderId = `${invoice.number}-${Date.now()}`;

    // Generate Snap token dari Midtrans API
    const snapResult = await createMidtransSnapTransaction({
      orderId,
      grossAmount,
      customer: customerDetails,
      items: itemDetails,
    });

    // Update existing PENDING Payment record untuk invoice ini, atau buat baru jika belum ada
    const existingPending = await prisma.payment.findFirst({
      where: {
        invoiceId: invoice.id,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingPending) {
      await prisma.payment.update({
        where: { id: existingPending.id },
        data: {
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
            orderId,
            createdAt: new Date().toISOString(),
          },
        },
      });
    } else {
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
            orderId,
            createdAt: new Date().toISOString(),
          },
        },
      });
    }

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
