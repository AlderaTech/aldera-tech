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

  const subtotal = data.items.reduce(
    (sum, it) => sum + it.quantity * it.price,
    0
  );
  const taxAmount = (subtotal * data.taxRate) / 100;
  const total = subtotal + taxAmount;
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
