"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2, Mail, Eye } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BulkActionBar } from "@/components/dashboard/bulk-action-bar";
import {
  bulkInvoiceStatusAction,
  bulkInvoiceDeleteAction,
} from "@/lib/actions/bulk";
import { formatCurrency, formatDate } from "@/lib/utils";
import { invoiceStatusMeta } from "@/lib/status-meta";
import type { InvoiceStatus } from "@prisma/client";

type InvoiceRow = {
  id: string;
  number: string;
  status: InvoiceStatus;
  total: string;
  dueDate: Date;
  client: { name: string; company: string | null };
  project: { title: string } | null;
};

export function InvoiceTable({ invoices }: { invoices: InvoiceRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const allSelected = invoices.length > 0 && selected.size === invoices.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(invoices.map((inv) => inv.id)));
  }

  return (
    <div className="space-y-3">
      <BulkActionBar
        selectedIds={[...selected]}
        onClear={() => setSelected(new Set())}
        actions={[
          {
            label: "Tandai Lunas",
            icon: <CheckCircle2 className="size-3.5" />,
            onClick: async (ids) => {
              const r = await bulkInvoiceStatusAction(ids, "PAID");
              if (r.ok) toast.success(`${r.count} invoice ditandai lunas`);
              setSelected(new Set());
              router.refresh();
            },
          },
          {
            label: "Tandai Terkirim",
            icon: <Mail className="size-3.5" />,
            onClick: async (ids) => {
              const r = await bulkInvoiceStatusAction(ids, "SENT");
              if (r.ok) toast.success(`${r.count} invoice ditandai terkirim`);
              setSelected(new Set());
              router.refresh();
            },
          },
          {
            label: "Hapus",
            icon: <Trash2 className="size-3.5" />,
            destructive: true,
            confirm: "Hapus {count} invoice? Aksi tidak bisa di-undo.",
            onClick: async (ids) => {
              const r = await bulkInvoiceDeleteAction(ids);
              if (r.ok) toast.success(`${r.count} invoice dihapus`);
              setSelected(new Set());
              router.refresh();
            },
          },
        ]}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Nomor</TableHead>
            <TableHead className="hidden md:table-cell">Client</TableHead>
            <TableHead className="hidden xl:table-cell">Proyek</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Jatuh Tempo</TableHead>
            <TableHead className="w-24 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                Belum ada invoice.
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((inv) => {
              const m = invoiceStatusMeta[inv.status];
              const overdue =
                inv.status !== "PAID" &&
                inv.status !== "CANCELLED" &&
                inv.dueDate < new Date();
              return (
                <TableRow
                  key={inv.id}
                  data-state={selected.has(inv.id) ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={selected.has(inv.id)}
                      onCheckedChange={() => toggle(inv.id)}
                      aria-label={`Select ${inv.number}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {inv.number}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">{inv.client.name}</div>
                    {inv.client.company && (
                      <div className="text-xs text-muted-foreground">
                        {inv.client.company}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-sm text-muted-foreground truncate max-w-xs">
                    {inv.project?.title ?? "-"}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(Number(inv.total))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={overdue ? "destructive" : m.variant}>
                      {overdue ? "Overdue" : m.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate(inv.dueDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/invoices/${inv.id}`}>
                        <Eye className="size-3.5" />
                        Detail
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
