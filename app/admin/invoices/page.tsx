import Link from "next/link";
import { Plus, Download, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROUTES, API_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { InvoiceTable } from "./_components/invoice-table";

export default async function AdminInvoicesPage() {
  const raw = await safeDb(
    async () =>
      await prisma.invoice.findMany({
        orderBy: { issueDate: "desc" },
        include: {
          client: { select: { name: true } },
          project: { select: { title: true } },
        },
      }),
    []
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

      <Card className="overflow-hidden p-0">
        <InvoiceTable invoices={invoices} />
      </Card>
    </div>
  );
}
