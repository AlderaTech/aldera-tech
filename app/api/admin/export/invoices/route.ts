import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { csvResponse, toCsv } from "@/lib/csv";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (
    !session?.user ||
    !hasPermission(session.user.role, PERMISSIONS.INVOICE_VIEW)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invoices = await prisma.invoice.findMany({
    orderBy: { issueDate: "desc" },
    include: {
      client: { select: { name: true, email: true } },
      project: { select: { title: true } },
    },
  });

  const rows = invoices.map((inv) => ({
    number: inv.number,
    status: inv.status,
    clientName: inv.client.name,
    clientEmail: inv.client.email,
    project: inv.project?.title ?? "",
    currency: inv.currency,
    subtotal: Number(inv.subtotal).toFixed(2),
    taxRate: Number(inv.taxRate).toFixed(2),
    taxAmount: Number(inv.taxAmount).toFixed(2),
    total: Number(inv.total).toFixed(2),
    issueDate: inv.issueDate.toISOString().slice(0, 10),
    dueDate: inv.dueDate.toISOString().slice(0, 10),
    paidAt: inv.paidAt?.toISOString().slice(0, 10) ?? "",
    notes: inv.notes ?? "",
  }));

  const csv = toCsv(rows);
  const filename = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
  return csvResponse(csv, filename);
}
