import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { sendWhatsApp } from "@/lib/whatsapp";
import { waTemplates } from "@/lib/whatsapp-templates";
import { notify } from "@/lib/notifications";
import { formatCurrency } from "@/lib/utils";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import {
  verifyMidtransSignature,
  interpretMidtransStatus,
  getMidtransConfig,
} from "@/lib/midtrans";

/**
 * Midtrans Payment Webhook Handler
 *
 * Menerima notifikasi HTTP POST resmi dari Midtrans setelah transaksi diproses.
 * Memvalidasi signature hash SHA-512, memetakan status transaksi, memperbarui
 * status invoice secara atomik, dan mendistribusikan notifikasi WhatsApp/in-app.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let body: Record<string, unknown> = {};

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const orderId = String(body.order_id ?? "");
    const statusCode = String(body.status_code ?? "");
    const grossAmount = String(body.gross_amount ?? "");
    const signatureKey = String(body.signature_key ?? "");
    const transactionStatus = String(body.transaction_status ?? "");
    const fraudStatus = body.fraud_status
      ? String(body.fraud_status)
      : undefined;
    const transactionId = String(body.transaction_id ?? orderId);
    const paymentType = String(body.payment_type ?? "midtrans");

    if (
      !orderId ||
      !transactionStatus ||
      !signatureKey ||
      !statusCode ||
      !grossAmount
    ) {
      return NextResponse.json(
        { error: "Payload webhook Midtrans tidak lengkap" },
        { status: 400 }
      );
    }

    // Validasi Signature SHA-512 jika Server Key dikonfigurasi
    const { serverKey } = getMidtransConfig();
    if (!serverKey && process.env.NODE_ENV !== "test") {
      return NextResponse.json(
        { error: "MIDTRANS_SERVER_KEY tidak dikonfigurasi" },
        { status: 500 }
      );
    }

    if (serverKey) {
      const isValid = verifyMidtransSignature({
        orderId,
        statusCode,
        grossAmount,
        signatureKey,
        serverKey,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: "Signature Midtrans tidak valid" },
          { status: 401 }
        );
      }
    }

    // Parse nomor invoice asli jika orderId memiliki timestamp suffix: `${invoice.number}-${Date.now()}`
    let invoiceLookupTarget = orderId;
    const lastHyphenIdx = orderId.lastIndexOf("-");
    if (lastHyphenIdx > 0) {
      const suffix = orderId.slice(lastHyphenIdx + 1);
      if (/^\d{10,}$/.test(suffix)) {
        invoiceLookupTarget = orderId.slice(0, lastHyphenIdx);
      }
    }

    // Cari invoice berdasarkan nomor invoice atau id
    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [
          { id: orderId },
          { number: orderId },
          { id: invoiceLookupTarget },
          { number: invoiceLookupTarget },
        ],
      },
      include: { client: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: `Invoice dengan identifier '${orderId}' tidak ditemukan.` },
        { status: 404 }
      );
    }

    // Validasi nominal pembayaran terhadap total invoice
    if (Math.round(Number(grossAmount)) !== Math.round(Number(invoice.total))) {
      return NextResponse.json(
        { error: "Nominal pembayaran tidak sesuai dengan total tagihan" },
        { status: 400 }
      );
    }

    const paymentState = interpretMidtransStatus(
      transactionStatus,
      fraudStatus
    );

    if (paymentState === "SUCCESS") {
      await prisma.$transaction(async (tx) => {
        // Tandai invoice lunas
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            paymentMethod: "GATEWAY_MIDTRANS",
          },
        });

        // Rekonsiliasi record payment (update existing PENDING jika ada)
        const existingPayment = await tx.payment.findFirst({
          where: {
            OR: [
              { transactionId },
              { invoiceId: invoice.id, status: "PENDING" },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        if (existingPayment) {
          await tx.payment.update({
            where: { id: existingPayment.id },
            data: {
              transactionId,
              status: "SUCCESS",
              paymentType,
              gatewayResponse: body as unknown as Prisma.InputJsonValue,
            },
          });
        } else {
          await tx.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: invoice.total,
              currency: invoice.currency,
              status: "SUCCESS",
              paymentMethod: "GATEWAY_MIDTRANS",
              gateway: "midtrans",
              transactionId,
              paymentType,
              gatewayResponse: body as unknown as Prisma.InputJsonValue,
            },
          });
        }

        // Catat activity log proyek jika tagihan tertaut pada suatu proyek
        if (invoice.projectId) {
          await tx.activityLog.create({
            data: {
              projectId: invoice.projectId,
              userId: invoice.clientId,
              action: "INVOICE_PAID",
              description: `Invoice ${invoice.number} senilai ${formatCurrency(
                Number(invoice.total)
              )} telah lunas via Midtrans (${paymentType}).`,
              metadata: {
                invoiceId: invoice.id,
                invoiceNumber: invoice.number,
                gateway: "midtrans",
                transactionId,
                paymentType,
                amount: Number(invoice.total),
              },
            },
          });
        }
      });

      // Kirim WhatsApp alert ke nomor WhatsApp klien
      if (invoice.client.phone) {
        const tpl = waTemplates.invoicePaid(
          invoice.number,
          formatCurrency(Number(invoice.total))
        );
        sendWhatsApp({
          to: invoice.client.phone,
          message: `*${tpl.title}*\n\n${tpl.message}`,
        }).catch((err) => {
          console.error("Gagal mengirim WhatsApp invoice paid:", err);
        });
      }

      // Notifikasi in-app
      await notify({
        userId: invoice.clientId,
        type: "INVOICE_SENT",
        title: "Invoice Lunas",
        message: `Invoice ${invoice.number} senilai ${formatCurrency(
          Number(invoice.total)
        )} telah lunas diverifikasi via Midtrans.`,
      }).catch(() => {});

      // Revalidasi cache halaman terkait
      revalidatePath(ADMIN_ROUTES.invoices);
      revalidatePath(ADMIN_ROUTES.invoiceDetail(invoice.id));
      revalidatePath(DASHBOARD_ROUTES.invoices);
    } else if (paymentState === "FAILED") {
      // Perbarui status pembayaran menjadi GAGAL
      const existingPayment = await prisma.payment.findFirst({
        where: {
          OR: [
            { transactionId },
            { invoiceId: invoice.id, status: "PENDING" },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingPayment) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            transactionId,
            status: "FAILED",
            paymentType,
            rejectionReason: `Pembayaran ${transactionStatus} via Midtrans`,
            gatewayResponse: body as unknown as Prisma.InputJsonValue,
          },
        });
      } else {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: invoice.total,
            currency: invoice.currency,
            status: "FAILED",
            paymentMethod: "GATEWAY_MIDTRANS",
            gateway: "midtrans",
            transactionId,
            paymentType,
            rejectionReason: `Pembayaran ${transactionStatus} via Midtrans`,
            gatewayResponse: body as unknown as Prisma.InputJsonValue,
          },
        });
      }

      revalidatePath(ADMIN_ROUTES.invoiceDetail(invoice.id));
      revalidatePath(DASHBOARD_ROUTES.invoices);
    } else if (paymentState === "REFUNDED") {
      // Perbarui status pembayaran menjadi REFUNDED
      await prisma.$transaction(async (tx) => {
        const existingPayment = await tx.payment.findFirst({
          where: {
            OR: [
              { transactionId },
              { invoiceId: invoice.id, status: "PENDING" },
              { invoiceId: invoice.id, status: "SUCCESS" },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        if (existingPayment) {
          await tx.payment.update({
            where: { id: existingPayment.id },
            data: {
              transactionId,
              status: "REFUNDED",
              paymentType,
              gatewayResponse: body as unknown as Prisma.InputJsonValue,
            },
          });
        } else {
          await tx.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: invoice.total,
              currency: invoice.currency,
              status: "REFUNDED",
              paymentMethod: "GATEWAY_MIDTRANS",
              gateway: "midtrans",
              transactionId,
              paymentType,
              gatewayResponse: body as unknown as Prisma.InputJsonValue,
            },
          });
        }

        if (invoice.projectId) {
          await tx.activityLog.create({
            data: {
              projectId: invoice.projectId,
              userId: invoice.clientId,
              action: "PROJECT_UPDATED",
              description: `Pembayaran invoice ${invoice.number} senilai ${formatCurrency(
                Number(invoice.total)
              )} telah di-refund via Midtrans (${paymentType}).`,
              metadata: {
                invoiceId: invoice.id,
                invoiceNumber: invoice.number,
                gateway: "midtrans",
                transactionId,
                paymentType,
                amount: Number(invoice.total),
                status: "REFUNDED",
              },
            },
          });
        }
      });

      revalidatePath(ADMIN_ROUTES.invoices);
      revalidatePath(ADMIN_ROUTES.invoiceDetail(invoice.id));
      revalidatePath(DASHBOARD_ROUTES.invoices);
    } else if (paymentState === "PENDING") {
      // Rekam pembayaran pending
      const existingPayment = await prisma.payment.findFirst({
        where: {
          OR: [
            { transactionId },
            { invoiceId: invoice.id, status: "PENDING" },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingPayment) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            transactionId,
            status: "PENDING",
            paymentType,
            gatewayResponse: body as unknown as Prisma.InputJsonValue,
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
            transactionId,
            paymentType,
            gatewayResponse: body as unknown as Prisma.InputJsonValue,
          },
        });
      }
    }

    return NextResponse.json({
      status: "ok",
      invoiceId: invoice.id,
      paymentState,
      transactionStatus,
    });
  } catch (error: unknown) {
    console.error("Midtrans payment webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
