"use server";

import { revalidatePath } from "next/cache";
import { issueDueRecurringInvoices as issueRecurring } from "@/lib/recurring-invoice-issuer";
import { prisma } from "@/lib/prisma";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { ADMIN_ROUTES } from "@/lib/routes";
import { recurringInvoiceSchema } from "@/lib/validations/recurring-invoice";

export async function createRecurringTemplateAction(formData: FormData) {
  await requirePermission(PERMISSIONS.INVOICE_CREATE);
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
  await requirePermission(PERMISSIONS.INVOICE_EDIT);
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
  await requirePermission(PERMISSIONS.INVOICE_DELETE);
  await prisma.recurringInvoiceTemplate.delete({ where: { id } });
  revalidatePath(ADMIN_ROUTES.invoicesRecurring);
}

/**
 * Called by cron. Issues invoices from any due recurring template.
 */
export async function issueDueRecurringInvoices() {
  await requirePermission(PERMISSIONS.INVOICE_CREATE);
  const result = await issueRecurring();
  revalidatePath(ADMIN_ROUTES.invoices);
  revalidatePath(ADMIN_ROUTES.invoicesRecurring);
  return result;
}
