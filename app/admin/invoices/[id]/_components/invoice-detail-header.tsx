import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Download,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADMIN_ROUTES, API_ROUTES } from "@/lib/routes";
import { invoiceStatusMeta } from "@/lib/status-meta";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceDetail } from "../_data/invoice-detail";
import { getInvoiceDueLabel } from "../_data/invoice-detail";

export function InvoiceDetailHeader({ invoice }: { invoice: InvoiceDetail }) {
  const statusMeta = invoiceStatusMeta[invoice.status];
  const dueLabel = getInvoiceDueLabel(invoice.dueDate, invoice.paidAt);
  const summaryItems = [
    {
      label: "Total invoice",
      value: formatCurrency(Number(invoice.total)),
      icon: WalletCards,
    },
    {
      label: "Status",
      value: statusMeta.label,
      icon: CheckCircle2,
    },
    {
      label: "Jatuh tempo",
      value: dueLabel,
      icon: CalendarClock,
    },
    {
      label: "Line item",
      value: invoice.items.length,
      icon: ReceiptText,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href={ADMIN_ROUTES.invoices}>
              <ArrowLeft className="size-4" /> Kembali ke Invoice
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 xxxl:text-3xl">
              {invoice.number}
            </h1>
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>Terbit: {formatDate(invoice.issueDate)}</span>
            <span>Jatuh tempo: {formatDate(invoice.dueDate)}</span>
            {invoice.paidAt && (
              <span className="text-success">
                Dibayar: {formatDate(invoice.paidAt)}
              </span>
            )}
          </div>
        </div>

        <Button asChild className="h-10">
          <a href={API_ROUTES.invoicePdf(invoice.id)} download>
            <Download className="size-4" /> Download PDF
          </a>
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-medium text-slate-500">
                {item.label}
              </div>
              <item.icon className="size-4 text-primary" />
            </div>
            <div className="mt-1 truncate text-lg font-semibold tracking-tight text-slate-950">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
