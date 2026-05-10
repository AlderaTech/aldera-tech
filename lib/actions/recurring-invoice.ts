"use server";

import { revalidatePath } from "next/cache";
import type { RecurringFrequency } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";
import { ADMIN_ROUTES } from "@/lib/routes";
import { recurringInvoiceSchema } from "@/lib/validations/recurring-invoice";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

function advanceDate(from: Date, frequency: RecurringFrequency): Date {
  const d = new Date(from);
  switch (frequency) {
    case "WEEKLY":
      d.setDate(d.getDate() + 7);
      break;
    case "MONTHLY":
      d.setMonth(d.getMonth() + 1);
      break;
    case "QUARTERLY":
      d.setMonth(d.getMonth() + 3);
      break;
    case "YEARLY":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d;
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

export async function createRecurringTemplateAction(formData: FormData) {
  await requireAdmin();
  const itemsRaw = formData.get("items");
  let itemsParsed: unknown;
  try {
    itemsParsed = JSON.parse(String(itemsRaw ?? "[]"));
  } catch {
    return { ok: false, message: "Items tidak valid." };
  }

  const parsed = recurringInvoiceSchema.safeParse({
    name: formData.get("name"),
    clientId: formData.get("clientId"),
    projectId: formData.get("projectId") || "",
    frequency: formData.get("frequency"),
    nextIssueDate: formData.get("nextIssueDate"),
    dueDays: formData.get("dueDays") ?? "14",
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

  const template = await prisma.recurringInvoiceTemplate.create({
    data: {
      name: data.name,
      clientId: data.clientId,
      projectId: data.projectId || null,
      frequency: data.frequency,
      nextIssueDate: new Date(data.nextIssueDate),
      dueDays: data.dueDays,
      taxRate: data.taxRate.toString(),
      notes: data.notes || null,
      items: data.items as unknown as object,
      active: true,
    },
    select: { id: true },
  });

  revalidatePath(ADMIN_ROUTES.invoicesRecurring);
  return { ok: true, id: template.id, message: "Template dibuat." };
}

export async function toggleRecurringActiveAction(id: string) {
  await requireAdmin();
  const t = await prisma.recurringInvoiceTemplate.findUnique({
    where: { id },
    select: { active: true },
  });
  if (!t) return;
  await prisma.recurringInvoiceTemplate.update({
    where: { id },
    data: { active: !t.active },
  });
  revalidatePath(ADMIN_ROUTES.invoicesRecurring);
}

export async function deleteRecurringAction(id: string) {
  await requireAdmin();
  await prisma.recurringInvoiceTemplate.delete({ where: { id } });
  revalidatePath(ADMIN_ROUTES.invoicesRecurring);
}

/**
 * Called by cron. Issues invoices from any due recurring template.
 */
export async function issueDueRecurringInvoices(): Promise<{ issued: number }> {
  const now = new Date();
  const due = await prisma.recurringInvoiceTemplate.findMany({
    where: { active: true, nextIssueDate: { lte: now } },
  });

  let issued = 0;
  for (const template of due) {
    const items = Array.isArray(template.items)
      ? (template.items as Array<{
          description: string;
          quantity: number | string;
          price: number | string;
        }>)
      : [];
    if (items.length === 0) continue;

    const subtotal = items.reduce(
      (sum, it) => sum + Number(it.quantity) * Number(it.price),
      0
    );
    const taxAmount = (subtotal * Number(template.taxRate)) / 100;
    const total = subtotal + taxAmount;
    const number = await generateInvoiceNumber();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + template.dueDays);

    await prisma.invoice.create({
      data: {
        number,
        status: "SENT",
        issueDate: now,
        dueDate,
        subtotal: subtotal.toFixed(2),
        taxRate: template.taxRate,
        taxAmount: taxAmount.toFixed(2),
        total: total.toFixed(2),
        currency: template.currency,
        notes: template.notes,
        clientId: template.clientId,
        projectId: template.projectId,
        recurringTemplateId: template.id,
        items: {
          create: items.map((it, idx) => ({
            description: it.description,
            quantity: String(it.quantity),
            price: String(it.price),
            total: (Number(it.quantity) * Number(it.price)).toFixed(2),
            order: idx,
          })),
        },
      },
    });

    await prisma.recurringInvoiceTemplate.update({
      where: { id: template.id },
      data: {
        lastIssuedAt: now,
        nextIssueDate: advanceDate(now, template.frequency),
      },
    });

    issued++;
  }
  revalidatePath(ADMIN_ROUTES.invoices);
  revalidatePath(ADMIN_ROUTES.invoicesRecurring);
  return { issued };
}
