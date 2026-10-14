import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { sendWhatsApp } from "@/lib/whatsapp";
import { waTemplates } from "@/lib/whatsapp-templates";
import { notify } from "@/lib/notifications";
import { formatCurrency } from "@/lib/utils";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

function timingSafeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(a, "utf-8"),
    Buffer.from(b, "utf-8")
  );
}

function verifyMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
  serverKey: string;
}): boolean {
  const payload = `${params.orderId}${params.statusCode}${params.grossAmount}${params.serverKey}`;
  const computedHash = crypto
    .createHash("sha512")
    .update(payload)
    .digest("hex");
  return timingSafeEquals(computedHash, params.signatureKey);
}

function verifyXenditToken(
  receivedToken: string | null,
  expectedToken: string
): boolean {
  if (!receivedToken || !expectedToken) return false;
  return timingSafeEquals(receivedToken, expectedToken);
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const gatewayParam = searchParams.get("gateway");
    const xenditHeader = request.headers.get("x-callback-token");

    const isMidtrans =
      gatewayParam === "midtrans" ||
      (typeof body.signature_key === "string" &&
        typeof body.order_id === "string");
    const isXendit =
      gatewayParam === "xendit" ||
      Boolean(xenditHeader) ||
      (typeof body.external_id === "string" && !isMidtrans);

    if (isMidtrans) {
      return await handleMidtrans(body);
    } else if (isXendit) {
      return await handleXendit(body, xenditHeader);
    }

    return NextResponse.json(
      { error: "Unknown payment gateway" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleMidtrans(body: Record<string, unknown>) {
  const orderId = String(body.order_id ?? "");
  const statusCode = String(body.status_code ?? "");
  const grossAmount = String(body.gross_amount ?? "");
  const signatureKey = String(body.signature_key ?? "");
  const transactionStatus = String(body.transaction_status ?? "");
  const fraudStatus = String(body.fraud_status ?? "");
  const transactionId = String(body.transaction_id ?? orderId);
  const paymentType = String(body.payment_type ?? "midtrans");

  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
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
        { error: "Invalid Midtrans signature" },
        { status: 401 }
      );
    }
  }

  const isSuccess =
    transactionStatus === "settlement" ||
    (transactionStatus === "capture" && fraudStatus === "accept");

  return await reconcileInvoicePayment({
    lookupKey: orderId,
    gateway: "midtrans",
    transactionId,
    paymentType,
    paymentMethod: "GATEWAY_MIDTRANS",
    isSuccess,
    rawPayload: body,
  });
}

async function handleXendit(
  body: Record<string, unknown>,
  callbackTokenHeader: string | null
) {
  const externalId = String(body.external_id ?? "");
  const status = String(body.status ?? "");
  const transactionId = String(body.id ?? externalId);
  const paymentMethodType = String(body.payment_method ?? "xendit");

  const expectedToken = process.env.XENDIT_CALLBACK_TOKEN ?? "";
  if (expectedToken) {
    const isValid = verifyXenditToken(callbackTokenHeader, expectedToken);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Xendit callback token" },
        { status: 401 }
      );
    }
  }

  const isSuccess = ["PAID", "SETTLED", "COMPLETED"].includes(
    status.toUpperCase()
  );

  return await reconcileInvoicePayment({
    lookupKey: externalId,
    gateway: "xendit",
    transactionId,
    paymentType: paymentMethodType,
    paymentMethod: "GATEWAY_XENDIT",
    isSuccess,
    rawPayload: body,
  });
}

async function reconcileInvoicePayment(params: {
  lookupKey: string;
  gateway: "midtrans" | "xendit";
  transactionId: string;
  paymentType: string;
  paymentMethod: "GATEWAY_MIDTRANS" | "GATEWAY_XENDIT";
  isSuccess: boolean;
  rawPayload: Record<string, unknown>;
}) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      OR: [{ id: params.lookupKey }, { number: params.lookupKey }],
    },
    include: { client: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (params.isSuccess) {
    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          paymentMethod: params.paymentMethod,
        },
      });

      await tx.payment.upsert({
        where: { transactionId: params.transactionId },
        create: {
          invoiceId: invoice.id,
          amount: invoice.total,
          currency: invoice.currency,
          status: "SUCCESS",
          paymentMethod: params.paymentMethod,
          gateway: params.gateway,
          transactionId: params.transactionId,
          paymentType: params.paymentType,
          gatewayResponse:
            params.rawPayload as unknown as Prisma.InputJsonValue,
        },
        update: {
          status: "SUCCESS",
          gatewayResponse:
            params.rawPayload as unknown as Prisma.InputJsonValue,
        },
      });

      if (invoice.projectId) {
        await tx.activityLog.create({
          data: {
            projectId: invoice.projectId,
            userId: invoice.clientId,
            action: "INVOICE_PAID",
            description: `Invoice ${invoice.number} senilai ${formatCurrency(Number(invoice.total))} telah lunas via ${params.gateway} (${params.paymentType}).`,
            metadata: {
              invoiceId: invoice.id,
              invoiceNumber: invoice.number,
              gateway: params.gateway,
              transactionId: params.transactionId,
              amount: Number(invoice.total),
            },
          },
        });
      }
    });

    if (invoice.client.phone) {
      const tpl = waTemplates.invoicePaid(
        invoice.number,
        formatCurrency(Number(invoice.total))
      );
      sendWhatsApp({
        to: invoice.client.phone,
        message: `*${tpl.title}*\n\n${tpl.message}`,
      }).catch(() => {});
    }

    await notify({
      userId: invoice.clientId,
      type: "INVOICE_SENT",
      title: "Invoice Lunas",
      message: `Invoice ${invoice.number} senilai ${formatCurrency(Number(invoice.total))} telah lunas via ${params.gateway}.`,
    }).catch(() => {});

    revalidatePath(ADMIN_ROUTES.invoices);
    revalidatePath(ADMIN_ROUTES.invoiceDetail(invoice.id));
    revalidatePath(DASHBOARD_ROUTES.invoices);
  }

  return NextResponse.json({
    status: "ok",
    invoiceId: invoice.id,
    reconciled: params.isSuccess,
  });
}
