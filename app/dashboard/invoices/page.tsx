import { Download } from "lucide-react";
import { auth } from "@/auth";
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
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { invoiceStatusMeta } from "@/lib/status-meta";
import { API_ROUTES } from "@/lib/routes";

export default async function UserInvoicesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const invoices = await safeDb(
    async () =>
      await prisma.invoice.findMany({
        where: { clientId: userId },
        orderBy: { issueDate: "desc" },
        include: { project: { select: { title: true } } },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight xxxl:text-3xl">
          Invoice
        </h1>
        <p className="text-muted-foreground">
          Semua tagihan Anda, transparan dan bisa diunduh sebagai PDF.
        </p>
      </div>

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
                const overdue =
                  inv.status !== "PAID" &&
                  inv.status !== "CANCELLED" &&
                  inv.dueDate < new Date();
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.number}</TableCell>
                    <TableCell className="hidden max-w-xs truncate text-sm text-muted-foreground md:table-cell">
                      {inv.project?.title ?? "-"}
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatCurrency(Number(inv.total))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={overdue ? "destructive" : m.variant}>
                        {overdue ? "Overdue" : m.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {formatDate(inv.dueDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <a href={API_ROUTES.invoicePdf(inv.id)} download>
                          <Download className="size-3.5" /> PDF
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
