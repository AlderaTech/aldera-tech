import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  verifyMidtransSignature,
  interpretMidtransStatus,
  getMidtransConfig,
} from "@/lib/midtrans";
import { recordMidtransEvent } from "@/lib/midtrans-payment-event";
import { processInvoiceBalanceEffects } from "@/lib/invoice-balance-effects";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { notify } from "@/lib/notifications";
import { waTemplates } from "@/lib/whatsapp-templates";
import { formatCurrency } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(await request.text());
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (!body || Array.isArray(body) || typeof body !== "object")
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    const orderId = String(body.order_id ?? "");
    const statusCode = String(body.status_code ?? "");
    const grossAmount = String(body.gross_amount ?? "");
    const signatureKey = String(body.signature_key ?? "");
    const transactionStatus = String(body.transaction_status ?? "");
    if (
      ![
        orderId,
        statusCode,
        grossAmount,
        signatureKey,
        transactionStatus,
      ].every(Boolean)
    )
      return NextResponse.json(
        { error: "Payload webhook Midtrans tidak lengkap" },
        { status: 400 }
      );
    const { serverKey } = getMidtransConfig();
    if (!serverKey)
      return NextResponse.json(
        { error: "MIDTRANS_SERVER_KEY tidak dikonfigurasi" },
        { status: 503 }
      );
    if (
      !verifyMidtransSignature({
        orderId,
        statusCode,
        grossAmount,
        signatureKey,
        serverKey,
      })
    )
      return NextResponse.json(
        { error: "Signature Midtrans tidak valid" },
        { status: 401 }
      );
    const identifier = orderId.replace(/-\d{10,}$/, "");
    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [
          { id: orderId },
          { number: orderId },
          { id: identifier },
          { number: identifier },
        ],
      },
    });
    if (!invoice)
      return NextResponse.json(
        {
          error: "Invoice dengan identifier '" + orderId + "' tidak ditemukan.",
        },
        { status: 404 }
      );
    if (
      !/^\d+(\.\d{1,2})?$/.test(grossAmount) ||
      !invoice.total.equals(new Prisma.Decimal(grossAmount))
    )
      return NextResponse.json(
        { error: "Nominal pembayaran tidak sesuai dengan total tagihan" },
        { status: 400 }
      );
    if (
      transactionStatus === "partial_refund" ||
      (body.refund_amount !== undefined &&
        !new Prisma.Decimal(String(body.refund_amount)).equals(invoice.total))
    )
      return NextResponse.json(
        { error: "Refund parsial memerlukan rekonsiliasi admin." },
        { status: 409 }
      );
    const paymentState = interpretMidtransStatus(
      transactionStatus,
      body.fraud_status ? String(body.fraud_status) : undefined
    );
    const changed = await recordMidtransEvent({
      invoiceId: invoice.id,
      transactionId: String(body.transaction_id ?? orderId),
      paymentType: String(body.payment_type ?? "midtrans"),
      state: paymentState,
      payload: body as Prisma.InputJsonObject,
    });
    await processInvoiceBalanceEffects(invoice.id);
    if (changed && paymentState === "SUCCESS") {
      const tpl = waTemplates.invoicePaid(
        invoice.number,
        formatCurrency(Number(invoice.total))
      );
      await notify({
        userId: invoice.clientId,
        type: "INVOICE_SENT",
        ...tpl,
      }).catch(() => console.error("Notifikasi pembayaran tertunda."));
    }
    revalidatePath(ADMIN_ROUTES.invoices);
    revalidatePath(ADMIN_ROUTES.invoiceDetail(invoice.id));
    revalidatePath(DASHBOARD_ROUTES.invoices);
    return NextResponse.json({
      status: "ok",
      message: changed ? "Processed" : "Already processed",
      invoiceId: invoice.id,
      paymentState,
      transactionStatus,
    });
  } catch {
    console.error(
      "Midtrans webhook gagal; pembayaran/rekonsiliasi perlu dicoba ulang."
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
