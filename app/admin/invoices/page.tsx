import Link from "next/link";
import { Plus, Download, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROUTES, API_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { InvoiceTable } from "./_components/invoice-table";
import { InvoiceStatus, type Prisma } from "@prisma/client";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { ParamFilterSelect } from "@/components/shared/param-filter-select";

const invoiceStatusOptions = [
  { label: "Semua Status", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Terkirim", value: "SENT" },
  { label: "Menunggu Verifikasi", value: "PENDING_VERIFICATION" },
  { label: "Lunas", value: "PAID" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Dibatalkan", value: "CANCELLED" },
];

export interface AdminInvoicesPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminInvoicesPage({
  searchParams,
}: AdminInvoicesPageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);
  const PAGE_SIZE = 10;
  const q = sp?.q?.trim();
  const rawStatus = sp?.status?.trim()?.toUpperCase();

  const where: Prisma.InvoiceWhereInput = {};
  if (
    rawStatus &&
    rawStatus !== "ALL" &&
    Object.values(InvoiceStatus).includes(rawStatus as InvoiceStatus)
  ) {
    where.status = rawStatus as InvoiceStatus;
  }

  if (q) {
    where.OR = [
      { number: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
      { project: { title: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [raw, totalCount] = await safeDb(
    async () =>
      await Promise.all([
        prisma.invoice.findMany({
          where,
          orderBy: { issueDate: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          include: {
            client: { select: { name: true } },
            project: { select: { title: true } },
          },
        }),
        prisma.invoice.count({ where }),
      ]),
    [[], 0]
  );

  // Decimal is not JSON-serializable directly, convert to string for client
  const invoices = raw.map((inv) => ({
    id: inv.id,
    number: inv.number,
    status: inv.status,
    total: inv.total.toString(),
    dueDate: inv.dueDate,
    client: inv.client,
    project: inv.project,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice</h1>
          <p className="text-muted-foreground">Kelola tagihan untuk klien.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={ADMIN_ROUTES.invoicesRecurring}>
              <Repeat className="size-4" /> Recurring
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href={API_ROUTES.exportInvoices} download>
              <Download className="size-4" /> Export CSV
            </a>
          </Button>
          <Button asChild>
            <Link href={ADMIN_ROUTES.invoiceNew}>
              <Plus className="size-4" /> Invoice Baru
            </Link>
          </Button>
        </div>
      </div>

      <SearchFilterBar
        placeholder="Cari nomor invoice, client, atau proyek..."
        searchParamKey="q"
      >
        <ParamFilterSelect
          paramKey="status"
          options={invoiceStatusOptions}
          placeholder="Filter status..."
        />
      </SearchFilterBar>

      <Card className="overflow-hidden p-0">
        <InvoiceTable
          invoices={invoices}
          totalItems={totalCount}
          currentPage={page}
          pageSize={PAGE_SIZE}
        />
      </Card>
    </div>
  );
}
