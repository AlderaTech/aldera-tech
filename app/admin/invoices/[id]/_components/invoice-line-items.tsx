import Link from "next/link";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ADMIN_ROUTES } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";
import type { InvoiceDetail } from "../_data/invoice-detail";

export function InvoiceLineItems({ invoice }: { invoice: InvoiceDetail }) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
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
                href={ADMIN_ROUTES.projectDetail(invoice.project.id)}
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
                <TableHead className="w-20 text-right">Qty</TableHead>
                <TableHead className="w-36 text-right">Harga</TableHead>
                <TableHead className="w-36 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-800">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(item.quantity).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(Number(item.price))}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatCurrency(Number(item.total))}
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
  );
}
