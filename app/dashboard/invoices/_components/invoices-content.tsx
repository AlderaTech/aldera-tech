import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { ClientInvoicesTable } from "./client-invoices-table";
import { InvoicesSummary } from "./invoices-summary";
import { InvoicesLoadError } from "./invoices-load-error";

export async function InvoicesContent() {
  const session = await auth();
  const userId = session!.user.id;
  const rawInvoices = await safeDb(
    async () =>
      await prisma.invoice.findMany({
        where: { clientId: userId, status: { not: "DRAFT" } },
        orderBy: { issueDate: "desc" },
        include: { project: { select: { title: true } } },
      }),
    null
  );

  if (rawInvoices === null) return <InvoicesLoadError />;

  const invoices = rawInvoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    status: inv.status,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    total: Number(inv.total),
    paymentProofUrl: inv.paymentProofUrl,
    project: inv.project ? { title: inv.project.title } : null,
  }));

  return (
    <>
      <InvoicesSummary invoices={invoices} />
      <ClientInvoicesTable invoices={invoices} />
    </>
  );
}
