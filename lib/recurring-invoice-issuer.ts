import type { RecurringFrequency } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { nextDocumentNumber } from "@/lib/document-number";
import { recurringInvoiceSchema } from "@/lib/validations/recurring-invoice";

export function advanceBillingDate(from: Date, frequency: RecurringFrequency) {
  const date = new Date(from);
  if (frequency === "WEEKLY") {
    date.setUTCDate(date.getUTCDate() + 7);
    return date;
  }
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(
    date.getUTCMonth() +
      (frequency === "MONTHLY" ? 1 : frequency === "QUARTERLY" ? 3 : 12)
  );
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date;
}

export async function issueDueRecurringInvoices(now = new Date()) {
  const due = await prisma.recurringInvoiceTemplate.findMany({
    where: { active: true, nextIssueDate: { lte: now } },
    select: { id: true },
  });
  let issued = 0;
  for (const { id } of due) {
    const changed = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "RecurringInvoiceTemplate" WHERE "id" = ${id} FOR UPDATE`;
      const template = await tx.recurringInvoiceTemplate.findUniqueOrThrow({
        where: { id },
      });
      if (!template.active || template.nextIssueDate > now) return false;
      const items = recurringInvoiceSchema.shape.items.parse(template.items);
      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      const taxAmount = (subtotal * Number(template.taxRate)) / 100;
      const dueDate = new Date(now);
      dueDate.setUTCDate(dueDate.getUTCDate() + template.dueDays);
      await tx.invoice.create({
        data: {
          number: await nextDocumentNumber(tx, "invoice", now),
          status: "SENT",
          issueDate: now,
          dueDate,
          subtotal: subtotal.toFixed(2),
          taxRate: template.taxRate,
          taxAmount: taxAmount.toFixed(2),
          total: (subtotal + taxAmount).toFixed(2),
          currency: template.currency,
          notes: template.notes,
          clientId: template.clientId,
          projectId: template.projectId,
          recurringTemplateId: id,
          items: {
            create: items.map((item, order) => ({
              description: item.description,
              quantity: String(item.quantity),
              price: String(item.price),
              total: (item.quantity * item.price).toFixed(2),
              order,
            })),
          },
        },
      });
      await tx.recurringInvoiceTemplate.update({
        where: { id },
        data: {
          lastIssuedAt: now,
          nextIssueDate: advanceBillingDate(
            template.nextIssueDate,
            template.frequency
          ),
        },
      });
      return true;
    });
    if (changed) issued++;
  }
  return { issued };
}
