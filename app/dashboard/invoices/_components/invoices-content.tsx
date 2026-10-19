import type { InvoiceStatus, Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { ClientInvoicesTable } from "./client-invoices-table";
import { InvoicesSummary } from "./invoices-summary";
import { InvoicesLoadError } from "./invoices-load-error";

const INVOICES_PER_PAGE = 10;

const VALID_CLIENT_INVOICE_STATUSES: readonly InvoiceStatus[] = [
  "SENT",
  "PAID",
  "OVERDUE",
  "PENDING_VERIFICATION",
  "CANCELLED",
];

export interface InvoicesContentProps {
  searchParams?: {
    status?: string;
    page?: string;
  };
}

export async function InvoicesContent({
  searchParams,
}: InvoicesContentProps = {}) {
  const session = await auth();
  const userId = session!.user.id;

  const rawStatus = searchParams?.status?.trim().toUpperCase();
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);

  const statusFilter =
    rawStatus &&
    VALID_CLIENT_INVOICE_STATUSES.includes(rawStatus as InvoiceStatus)
      ? (rawStatus as InvoiceStatus)
      : undefined;

  const where: Prisma.InvoiceWhereInput = {
    clientId: userId,
    status: statusFilter ? statusFilter : { not: "DRAFT" },
  };

  const result = await safeDb(async () => {
    const [totalCount, rawInvoices, allRawInvoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        orderBy: { issueDate: "desc" },
        skip: (page - 1) * INVOICES_PER_PAGE,
        take: INVOICES_PER_PAGE,
        include: { project: { select: { title: true } } },
      }),
      prisma.invoice.findMany({
        where: { clientId: userId, status: { not: "DRAFT" } },
        select: {
          id: true,
          number: true,
          status: true,
          issueDate: true,
          dueDate: true,
          total: true,
          paymentProofUrl: true,
        },
      }),
    ]);
    return { totalCount, rawInvoices, allRawInvoices };
  }, null);

  if (result === null) return <InvoicesLoadError />;

  const { totalCount, rawInvoices, allRawInvoices } = result;

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

  const summaryInvoices = allRawInvoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    status: inv.status,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    total: Number(inv.total),
    paymentProofUrl: inv.paymentProofUrl,
    project: null,
  }));

  return (
    <>
      <InvoicesSummary invoices={summaryInvoices} />
      <ClientInvoicesTable
        invoices={invoices}
        totalItems={totalCount}
        currentPage={page}
        pageSize={INVOICES_PER_PAGE}
      />
    </>
  );
}
