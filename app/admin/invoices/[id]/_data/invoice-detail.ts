import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";

const invoiceDetailInclude = {
  client: true,
  project: { select: { title: true, id: true } },
  items: { orderBy: { order: "asc" } },
  payments: { orderBy: { createdAt: "desc" } },
} satisfies Prisma.InvoiceInclude;

export type InvoiceDetail = Prisma.InvoiceGetPayload<{
  include: typeof invoiceDetailInclude;
}>;

export function getInvoiceDueLabel(dueDate: Date, paidAt: Date | null) {
  if (paidAt) return "Sudah dibayar";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return `Lewat ${Math.abs(diffDays)} hari`;
  if (diffDays === 0) return "Jatuh tempo hari ini";
  return `${diffDays} hari lagi`;
}

export async function getInvoiceDetail(id: string) {
  return safeDb(
    async () =>
      await prisma.invoice.findUnique({
        where: { id },
        include: invoiceDetailInclude,
      }),
    null
  );
}
