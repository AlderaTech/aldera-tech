import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
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
      include: { client: true, items: true },
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

    // If invoice is already marked PAID and this is not a refund, return HTTP 200 immediately
    if (invoice.status === "PAID" && paymentState !== "REFUNDED") {
      return NextResponse.json(
        { message: "Already processed" },
        { status: 200 }
      );
    }

    if (paymentState === "SUCCESS") {
      let alreadyProcessed = false;
      let shouldNotify = false;

      try {
        await prisma.$transaction(async (tx) => {
          // 1. Acquire row-level lock on the Invoice to serialize concurrent webhook requests
          const lockedInvoices = await tx.$queryRaw<
            Array<{ id: string; status: string }>
          >`SELECT "id", "status" FROM "Invoice" WHERE "id" = ${invoice.id} FOR UPDATE`;

          const currentStatus = lockedInvoices[0]?.status ?? invoice.status;
          if (currentStatus === "PAID") {
            alreadyProcessed = true;
            return;
          }

          // 2. Atomically update invoice status to PAID
          const updatedCount = await tx.invoice.updateMany({
            where: {
              id: invoice.id,
              status: { not: "PAID" },
            },
            data: {
              status: "PAID",
              paidAt: new Date(),
              paymentMethod: "GATEWAY_MIDTRANS",
            },
          });

          if (updatedCount.count === 0) {
            alreadyProcessed = true;
            return;
          }

          // 3. Reconcile Payment record (update existing PENDING jika ada, atau buat baru)
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

          // 4. Catat activity log proyek jika tagihan tertaut pada suatu proyek
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

          // 5. Synchronize AI Relay user balance and ledger if this invoice is an AI Relay top-up
          const isTopup =
            invoice.notes?.toLowerCase().includes("topup") ||
            invoice.notes?.toLowerCase().includes("top-up") ||
            orderId.toLowerCase().includes("topup") ||
            invoice.items?.some(
              (it) =>
                it.description.toLowerCase().includes("topup") ||
                it.description.toLowerCase().includes("top-up") ||
                it.description.toLowerCase().includes("saldo")
            );

          if (isTopup) {
            const { transactionRouter } = await import("@/lib/router-db");
            await transactionRouter(async (rClient) => {
              const userRes = await rClient.query<{
                id: string | number;
                balance: string | number;
              }>(
                "SELECT id, balance FROM users WHERE web_user_id = $1 FOR UPDATE;",
                [invoice.clientId]
              );

              let routerUser = userRes.rows[0];
              if (!routerUser) {
                const clientUser = invoice.client;
                const username =
                  clientUser?.email || `user_${invoice.clientId.slice(0, 8)}`;
                const fullName = clientUser?.name || "AI Relay Client";
                const insertRes = await rClient.query<{
                  id: string | number;
                  balance: string | number;
                }>(
                  `INSERT INTO users (web_user_id, full_name, username, balance, is_active)
                   VALUES ($1, $2, $3, 0.0000, true)
                   ON CONFLICT (web_user_id) DO UPDATE SET updated_at = NOW()
                   RETURNING id, balance;`,
                  [invoice.clientId, fullName, username]
                );
                routerUser = insertRes.rows[0];
              }

              if (!routerUser) {
                throw new Error(
                  `[Webhook] Failed to resolve or create router user for web_user_id: ${invoice.clientId}`
                );
              }

              const currentBalance = Number(routerUser.balance);
              const topupCredit = Number(invoice.total);
              const newBalance = Number(
                (currentBalance + topupCredit).toFixed(4)
              );

              await rClient.query(
                "UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2;",
                [newBalance, routerUser.id]
              );

              await rClient.query(
                `INSERT INTO balance_transactions (
                   user_id, amount, transaction_type, reference_id, balance_before, balance_after, notes, created_at
                 ) VALUES ($1, $2, 'topup', $3, $4, $5, $6, NOW());`,
                [
                  routerUser.id,
                  topupCredit,
                  transactionId,
                  currentBalance,
                  newBalance,
                  `Midtrans automated topup for Invoice ${invoice.number}`,
                ]
              );

              // Reset user_alert_cooldowns within the same atomic transaction
              const cooldownCheck = await rClient.query(
                "SELECT 1 FROM information_schema.tables WHERE table_name = 'user_alert_cooldowns' LIMIT 1;"
              );
              if (cooldownCheck.rows.length > 0) {
                await rClient.query(
                  "DELETE FROM user_alert_cooldowns WHERE user_id = $1;",
                  [routerUser.id]
                );
              }
            });
          }

          shouldNotify = true;
        });
      } catch (txError: unknown) {
        // Handle concurrent Prisma unique constraint violation (code: P2002) on transactionId
        if (
          typeof txError === "object" &&
          txError !== null &&
          "code" in txError &&
          (txError as { code: string }).code === "P2002"
        ) {
          return NextResponse.json(
            { message: "Already processed" },
            { status: 200 }
          );
        }
        throw txError;
      }

      if (alreadyProcessed) {
        return NextResponse.json(
          { message: "Already processed" },
          { status: 200 }
        );
      }

      // Deduplicated notification: exactly one WhatsApp message dispatched via notify()
      if (shouldNotify) {
        const tpl = waTemplates.invoicePaid(
          invoice.number,
          formatCurrency(Number(invoice.total))
        );
        await notify({
          userId: invoice.clientId,
          type: "INVOICE_SENT",
          title: tpl.title,
          message: tpl.message,
        }).catch((err) => {
          console.error("Gagal mengirim notifikasi invoice paid:", err);
        });
      }

      // Revalidasi cache halaman terkait
      revalidatePath(ADMIN_ROUTES.invoices);
      revalidatePath(ADMIN_ROUTES.invoiceDetail(invoice.id));
      revalidatePath(DASHBOARD_ROUTES.invoices);
    } else if (paymentState === "FAILED") {
      // Perbarui status pembayaran menjadi GAGAL
      const existingPayment = await prisma.payment.findFirst({
        where: {
          OR: [{ transactionId }, { invoiceId: invoice.id, status: "PENDING" }],
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
          OR: [{ transactionId }, { invoiceId: invoice.id, status: "PENDING" }],
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
