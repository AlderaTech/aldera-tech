"use client";

import * as React from "react";
import { Download, Eye, CreditCard } from "lucide-react";
import type { InvoiceStatus } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { invoiceStatusMeta } from "@/lib/status-meta";
import { API_ROUTES } from "@/lib/routes";
import { UploadProofDialog } from "./upload-proof-dialog";

export type ClientInvoiceItem = {
  id: string;
  number: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  total: number;
  paymentProofUrl: string | null;
  project: { title: string } | null;
};

export function ClientInvoicesTable({
  invoices,
}: {
  invoices: ClientInvoiceItem[];
}) {
  const [selectedInvoice, setSelectedInvoice] =
    React.useState<ClientInvoiceItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleOpenUpload = (invoice: ClientInvoiceItem) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor</TableHead>
              <TableHead className="hidden md:table-cell">Proyek</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">
                Jatuh Tempo
              </TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  Belum ada invoice.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => {
                const m = invoiceStatusMeta[inv.status];
                const isOverdue =
                  inv.status !== "PAID" &&
                  inv.status !== "CANCELLED" &&
                  inv.status !== "PENDING_VERIFICATION" &&
                  new Date(inv.dueDate) < new Date();

                const canUpload =
                  inv.status === "SENT" ||
                  inv.status === "OVERDUE" ||
                  inv.status === "PENDING_VERIFICATION";

                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.number}</TableCell>
                    <TableCell className="hidden max-w-xs truncate text-sm text-muted-foreground md:table-cell">
                      {inv.project?.title ?? "-"}
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatCurrency(inv.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isOverdue ? "destructive" : m.variant}>
                        {isOverdue ? "Overdue" : m.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {formatDate(inv.dueDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canUpload && (
                          <Button
                            size="sm"
                            variant={
                              inv.status === "PENDING_VERIFICATION"
                                ? "outline"
                                : "default"
                            }
                            className={
                              inv.status !== "PENDING_VERIFICATION"
                                ? "bg-brand-primary hover:bg-brand-primary-hover h-8 gap-1.5 text-xs text-white"
                                : "h-8 gap-1.5 text-xs"
                            }
                            onClick={() => handleOpenUpload(inv)}
                          >
                            {inv.status === "PENDING_VERIFICATION" ? (
                              <>
                                <Eye className="size-3.5" /> Lihat Bukti
                              </>
                            ) : (
                              <>
                                <CreditCard className="size-3.5" /> Bayar
                                Tagihan
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          asChild
                        >
                          <a href={API_ROUTES.invoicePdf(inv.id)} download>
                            <Download className="size-3.5" /> PDF
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {selectedInvoice && (
        <UploadProofDialog
          key={selectedInvoice.id}
          invoice={selectedInvoice}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  );
}
