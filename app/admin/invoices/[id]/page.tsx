import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Download,
  FileText,
  Mail,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { invoiceStatusMeta } from "@/lib/status-meta";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceStatusControls } from "./_components/invoice-status-controls";

type PageProps = {
  params: Promise<{ id: string }>;
};

function getDueLabel(dueDate: Date, paidAt: Date | null) {
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

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const invoice = await safeDb(
    async () =>
      await prisma.invoice.findUnique({
        where: { id },
        include: {
          client: true,
          project: { select: { title: true, id: true } },
          items: { orderBy: { order: "asc" } },
        },
      }),
    null
  );

  if (!invoice) notFound();

  const statusMeta = invoiceStatusMeta[invoice.status];
  const dueLabel = getDueLabel(invoice.dueDate, invoice.paidAt);
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
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 space-y-3">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link href="/admin/invoices">
                <ArrowLeft className="size-4" /> Kembali ke Invoice
              </Link>
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl xxxl:text-3xl font-bold tracking-tight text-slate-950">
                {invoice.number}
              </h1>
              <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 flex-wrap">
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
            <a href={`/api/invoices/${invoice.id}/pdf`} download>
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

      <InvoiceStatusControls invoiceId={invoice.id} status={invoice.status} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Bill to
                </div>
                <div className="mt-2 space-y-0.5">
                  <div className="font-semibold text-slate-950">
                    {invoice.client.name}
                  </div>
                  {invoice.client.company && (
                    <div className="text-sm text-slate-700">
                      {invoice.client.company}
                    </div>
                  )}
                  <div className="text-sm text-slate-500">
                    {invoice.client.email}
                  </div>
                  {invoice.client.phone && (
                    <div className="text-sm text-slate-500">
                      {invoice.client.phone}
                    </div>
                  )}
                </div>
              </div>

              {invoice.project && (
                <div className="max-w-sm text-left sm:text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Proyek
                  </div>
                  <Link
                    href={`/admin/projects/${invoice.project.id}`}
                    className="mt-2 block font-semibold text-slate-950 underline-offset-4 hover:underline"
                  >
                    {invoice.project.title}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="p-5">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right w-20">Qty</TableHead>
                    <TableHead className="text-right w-36">Harga</TableHead>
                    <TableHead className="text-right w-36">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell className="font-medium text-slate-800">
                        {it.description}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {Number(it.quantity).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(Number(it.price))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        {formatCurrency(Number(it.total))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-5 flex justify-end">
              <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="tabular-nums">
                    {formatCurrency(Number(invoice.subtotal))}
                  </span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-slate-500">
                    Pajak ({Number(invoice.taxRate)}%)
                  </span>
                  <span className="tabular-nums">
                    {formatCurrency(Number(invoice.taxAmount))}
                  </span>
                </div>
                <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-950">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatCurrency(Number(invoice.total))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Building2 className="size-4 text-primary" />
              Client
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Nama</span>
                <span className="text-right font-medium">{invoice.client.name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Email</span>
                <span className="text-right">{invoice.client.email}</span>
              </div>
              {invoice.client.phone && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Telepon</span>
                  <span className="text-right">{invoice.client.phone}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <FileText className="size-4 text-primary" />
              Catatan
            </div>
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {invoice.notes || "Tidak ada catatan untuk invoice ini."}
            </p>
          </Card>

          <Card className="border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <CalendarClock className="size-4 text-primary" />
              Tracking
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Dibuat</span>
                <span>{formatDate(invoice.createdAt)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Reminder terakhir</span>
                <span className="text-right">
                  {invoice.lastReminderSentAt
                    ? formatDate(invoice.lastReminderSentAt)
                    : "Belum pernah"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Email client</span>
                <span className="inline-flex items-center gap-1 text-right">
                  <Mail className="size-3.5" />
                  {invoice.client.email}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
