"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { InvoiceStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { invoiceCreateSchema } from "@/lib/validations/invoice";
import { sendWhatsApp } from "@/lib/whatsapp";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notify } from "@/lib/notifications";
import { waTemplates } from "@/lib/whatsapp-templates";
import { calculateInvoiceTotals } from "@/lib/invoice-utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session.user;
}

async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const last = await prisma.invoice.findFirst({
    where: { number: { startsWith: `INV-${year}-` } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const seq = last ? Number(last.number.split("-")[2] ?? 0) + 1 : 1;
  return `INV-${year}-${String(seq).padStart(4, "0")}`;
}

export type InvoiceActionState = {
  ok: boolean;
  message?: string;
  invoiceId?: string;
};

export async function createInvoiceAction(
  _: InvoiceActionState,
  formData: FormData
): Promise<InvoiceActionState> {
  await requireAdmin();

  const itemsRaw = formData.get("items");
  let itemsParsed: unknown;
  try {
    itemsParsed = JSON.parse(String(itemsRaw ?? "[]"));
  } catch {
    return { ok: false, message: "Items tidak valid." };
  }

  const parsed = invoiceCreateSchema.safeParse({
    clientId: formData.get("clientId"),
    projectId: formData.get("projectId") || "",
    issueDate: formData.get("issueDate"),
    dueDate: formData.get("dueDate"),
    taxRate: formData.get("taxRate") ?? "0",
    notes: formData.get("notes") || "",
    items: itemsParsed,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }
  const data = parsed.data;

  const { subtotal, taxAmount, total } = calculateInvoiceTotals(
    data.items,
    data.taxRate
  );
  const number = await generateInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      number,
      clientId: data.clientId,
      projectId: data.projectId || null,
      issueDate: new Date(data.issueDate),
      dueDate: new Date(data.dueDate),
      subtotal: subtotal.toFixed(2),
      taxRate: data.taxRate.toString(),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      notes: data.notes || null,
      items: {
        create: data.items.map((it, idx) => ({
          description: it.description,
          quantity: it.quantity.toString(),
          price: it.price.toString(),
          total: (it.quantity * it.price).toFixed(2),
          order: idx,
        })),
      },
    },
    select: { id: true },
  });

  revalidatePath(ADMIN_ROUTES.invoices);
  revalidatePath(ADMIN_ROUTES.home);
  revalidatePath(DASHBOARD_ROUTES.invoices);

  return { ok: true, invoiceId: invoice.id, message: "Invoice dibuat." };
}

export async function updateInvoiceStatusAction(
  invoiceId: string,
  status: InvoiceStatus
) {
  await requireAdmin();
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status,
      paidAt: status === "PAID" ? new Date() : null,
    },
    select: { id: true, clientId: true },
  });
  revalidatePath(ADMIN_ROUTES.invoices);
  revalidatePath(ADMIN_ROUTES.invoiceDetail(invoiceId));
  revalidatePath(DASHBOARD_ROUTES.invoices);
  return invoice;
}

export async function sendInvoiceWhatsAppAction(invoiceId: string) {
  await requireAdmin();
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: true },
  });
  if (!invoice) throw new Error("Invoice not found");
  if (!invoice.client.phone) {
    throw new Error(
      "Nomor WhatsApp klien belum terdaftar. Lengkapi nomor telepon klien terlebih dahulu."
    );
  }

  const tpl = waTemplates.invoiceSent(
    invoice.number,
    formatCurrency(Number(invoice.total)),
    formatDate(invoice.dueDate)
  );

  const res = await sendWhatsApp({
    to: invoice.client.phone,
    message: `*${tpl.title}*\n\n${tpl.message}`,
  });
  if (!res.success) {
    console.error("Send invoice WhatsApp error:", res.error);
    throw new Error(`Gagal mengirim WhatsApp: ${res.error ?? "Unknown error"}`);
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: invoice.status === "DRAFT" ? "SENT" : invoice.status,
    },
  });

  // Also log notification record
  await notify({
    userId: invoice.clientId,
    type: "INVOICE_SENT",
    ...tpl,
  }).catch(() => {});

  revalidatePath(ADMIN_ROUTES.invoiceDetail(invoiceId));
  revalidatePath(ADMIN_ROUTES.invoices);
}

// Backward-compatible alias
export const sendInvoiceEmailAction = sendInvoiceWhatsAppAction;

export async function sendReminderAction(invoiceId: string) {
  await requireAdmin();
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: true },
  });
  if (!invoice) throw new Error("Invoice not found");
  if (!invoice.client.phone) {
    throw new Error(
      "Nomor WhatsApp klien belum terdaftar. Lengkapi nomor telepon klien terlebih dahulu."
    );
  }

  const tpl = waTemplates.invoiceReminder(
    invoice.number,
    formatCurrency(Number(invoice.total)),
    formatDate(invoice.dueDate)
  );

  const res = await sendWhatsApp({
    to: invoice.client.phone,
    message: `*${tpl.title}*\n\n${tpl.message}`,
  });
  if (!res.success) {
    console.error("Send reminder WhatsApp error:", res.error);
    throw new Error(
      `Gagal mengirim reminder WhatsApp: ${res.error ?? "Unknown error"}`
    );
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { lastReminderSentAt: new Date() },
  });

  await notify({
    userId: invoice.clientId,
    type: "INVOICE_SENT",
    ...tpl,
  }).catch(() => {});

  revalidatePath(ADMIN_ROUTES.invoiceDetail(invoiceId));
}

export async function deleteInvoiceAction(invoiceId: string) {
  await requireAdmin();
  await prisma.invoice.delete({ where: { id: invoiceId } });
  revalidatePath(ADMIN_ROUTES.invoices);
  redirect(ADMIN_ROUTES.invoices);
}

export async function submitPaymentProofAction(input: {
  invoiceId: string;
  proofUrl: string;
  notes?: string;
}): Promise<{ ok: boolean; message?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Sesi tidak valid. Silakan login kembali." };
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: input.invoiceId },
    include: { client: true },
  });

  if (!invoice) {
    return { ok: false, message: "Invoice tidak ditemukan." };
  }

  if (invoice.clientId !== session.user.id && session.user.role !== "ADMIN") {
    return { ok: false, message: "Anda tidak memiliki akses ke invoice ini." };
  }

  if (invoice.status === "PAID") {
    return { ok: false, message: "Invoice ini sudah lunas." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "PENDING_VERIFICATION",
        paymentProofUrl: input.proofUrl,
        paymentMethod: "MANUAL_TRANSFER",
      },
    });

    await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.total,
        currency: invoice.currency,
        status: "PENDING",
        paymentMethod: "MANUAL_TRANSFER",
        gateway: "manual",
        proofUrl: input.proofUrl,
        proofUploadedAt: new Date(),
        notes: input.notes || null,
      },
    });

    if (invoice.projectId) {
      await tx.activityLog.create({
        data: {
          projectId: invoice.projectId,
          userId: session.user.id,
          action: "FILE_UPLOADED",
          description: `Bukti transfer untuk invoice ${invoice.number} telah diunggah.`,
          metadata: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.number,
            proofUrl: input.proofUrl,
          },
        },
      });
    }
  });

  if (invoice.client.phone) {
    const tpl = waTemplates.paymentProofReceived(
      invoice.number,
      formatCurrency(Number(invoice.total))
    );
    sendWhatsApp({
      to: invoice.client.phone,
      message: `*${tpl.title}*\n\n${tpl.message}`,
    }).catch(() => {});
  }

  revalidatePath(DASHBOARD_ROUTES.invoices);
  revalidatePath(ADMIN_ROUTES.invoices);
  revalidatePath(ADMIN_ROUTES.invoiceDetail(invoice.id));

  return {
    ok: true,
    message: "Bukti pembayaran berhasil diunggah dan menunggu verifikasi.",
  };
}

export async function verifyPaymentProofAction(
  invoiceId: string
): Promise<{ ok: boolean; message?: string }> {
  const admin = await requireAdmin();

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: true },
  });

  if (!invoice) {
    return { ok: false, message: "Invoice tidak ditemukan." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

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
          verifiedById: admin.id,
        },
      });
    } else {
      await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: invoice.total,
          currency: invoice.currency,
          status: "SUCCESS",
          paymentMethod: "MANUAL_TRANSFER",
          gateway: "manual",
          proofUrl: invoice.paymentProofUrl,
          verifiedAt: new Date(),
          verifiedById: admin.id,
        },
      });
    }

    if (invoice.projectId) {
      await tx.activityLog.create({
        data: {
          projectId: invoice.projectId,
          userId: admin.id,
          action: "INVOICE_PAID",
          description: `Pembayaran invoice ${invoice.number} senilai ${formatCurrency(Number(invoice.total))} telah diverifikasi lunas.`,
          metadata: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.number,
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
    title: "Pembayaran Lunas",
    message: `Invoice ${invoice.number} telah diverifikasi dan lunas.`,
  }).catch(() => {});

  revalidatePath(ADMIN_ROUTES.invoices);
  revalidatePath(ADMIN_ROUTES.invoiceDetail(invoiceId));
  revalidatePath(DASHBOARD_ROUTES.invoices);

  return {
    ok: true,
    message: "Pembayaran berhasil diverifikasi menjadi Lunas.",
  };
}

export async function rejectPaymentProofAction(
  invoiceId: string,
  reason: string
): Promise<{ ok: boolean; message?: string }> {
  const admin = await requireAdmin();

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: true },
  });

  if (!invoice) {
    return { ok: false, message: "Invoice tidak ditemukan." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "SENT",
        paymentProofUrl: null,
      },
    });

    const pendingPayment = await tx.payment.findFirst({
      where: { invoiceId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    if (pendingPayment) {
      await tx.payment.update({
        where: { id: pendingPayment.id },
        data: {
          status: "FAILED",
          rejectionReason: reason,
          verifiedAt: new Date(),
          verifiedById: admin.id,
        },
      });
    }
  });

  if (invoice.client.phone) {
    const tpl = waTemplates.paymentProofRejected(invoice.number, reason);
    sendWhatsApp({
      to: invoice.client.phone,
      message: `*${tpl.title}*\n\n${tpl.message}`,
    }).catch(() => {});
  }

  await notify({
    userId: invoice.clientId,
    type: "INVOICE_SENT",
    title: "Bukti Pembayaran Ditolak",
    message: `Bukti pembayaran invoice ${invoice.number} ditolak: ${reason}`,
  }).catch(() => {});

  revalidatePath(ADMIN_ROUTES.invoices);
  revalidatePath(ADMIN_ROUTES.invoiceDetail(invoiceId));
  revalidatePath(DASHBOARD_ROUTES.invoices);

  return { ok: true, message: "Bukti pembayaran ditolak." };
}
