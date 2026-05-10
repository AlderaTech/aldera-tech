import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { invoiceStatusMeta } from "@/lib/status-meta";
import { InvoiceStatusControls } from "./_components/invoice-status-controls";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

  const m = invoiceStatusMeta[invoice.status];

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin/invoices">
            <ArrowLeft className="size-4" /> Kembali ke Invoice
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl xxxl:text-3xl font-bold tracking-tight">
              {invoice.number}
            </h1>
            <Badge variant={m.variant}>{m.label}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span>Terbit: {formatDate(invoice.issueDate)}</span>
            <span>Jatuh tempo: {formatDate(invoice.dueDate)}</span>
            {invoice.paidAt && (
              <span className="text-success">
                Dibayar: {formatDate(invoice.paidAt)}
              </span>
            )}
          </div>
        </div>
        <Button asChild>
          <a href={`/api/invoices/${invoice.id}/pdf`} download>
            <Download className="size-4" /> Download PDF
          </a>
        </Button>
      </div>

      <InvoiceStatusControls invoiceId={invoice.id} status={invoice.status} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6 overflow-hidden">
          <div className="flex justify-between gap-4 mb-6">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Bill To
              </div>
              <div className="mt-1">
                <div className="font-semibold">{invoice.client.name}</div>
                {invoice.client.company && <div>{invoice.client.company}</div>}
                <div className="text-sm text-muted-foreground">
                  {invoice.client.email}
                </div>
                {invoice.client.phone && (
                  <div className="text-sm text-muted-foreground">
                    {invoice.client.phone}
                  </div>
                )}
              </div>
            </div>
            {invoice.project && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Proyek
                </div>
                <Link
                  href={`/admin/projects/${invoice.project.id}`}
                  className="font-medium hover:underline block mt-1"
                >
                  {invoice.project.title}
                </Link>
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right w-20">Qty</TableHead>
                <TableHead className="text-right w-32">Harga</TableHead>
                <TableHead className="text-right w-32">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.description}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(it.quantity).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(Number(it.price))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatCurrency(Number(it.total))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  {formatCurrency(Number(invoice.subtotal))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Pajak ({Number(invoice.taxRate)}%)
                </span>
                <span className="tabular-nums">
                  {formatCurrency(Number(invoice.taxAmount))}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t text-base font-bold">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatCurrency(Number(invoice.total))}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {invoice.notes && (
            <Card className="p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Catatan
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </Card>
          )}
          <Card className="p-5 space-y-1 text-sm">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Tracking
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dibuat</span>
              <span>{formatDate(invoice.createdAt)}</span>
            </div>
            {invoice.lastReminderSentAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reminder terakhir</span>
                <span>{formatDate(invoice.lastReminderSentAt)}</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
