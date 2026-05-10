import Link from "next/link";
import { Plus, Repeat } from "lucide-react";
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
import { ADMIN_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { formatDate } from "@/lib/utils";
import { RecurringRowActions } from "./_components/row-actions";

const FREQ_LABEL: Record<string, string> = {
  WEEKLY: "Mingguan",
  MONTHLY: "Bulanan",
  QUARTERLY: "3 Bulan",
  YEARLY: "Tahunan",
};

export default async function RecurringListPage() {
  const templates = await safeDb(
    async () =>
      await prisma.recurringInvoiceTemplate.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { invoices: true } },
        },
      }),
    []
  );

  // Fetch client names separately to keep query simple
  const clientIds = [...new Set(templates.map((t) => t.clientId))];
  const clients = await safeDb(
    async () =>
      clientIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: clientIds } },
            select: { id: true, name: true },
          })
        : [],
    [] as { id: string; name: string }[]
  );
  const nameById = new Map(clients.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href={ADMIN_ROUTES.invoices}>← Kembali ke Invoice</Link>
        </Button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Repeat className="size-5" />
              Invoice Berulang
            </h1>
            <p className="text-muted-foreground">
              Otomatisasi tagihan rutin. Invoice akan terbit sesuai frekuensi.
            </p>
          </div>
          <Button asChild>
            <Link href={ADMIN_ROUTES.invoiceRecurringNew}>
              <Plus className="size-4" /> Template Baru
            </Link>
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead>Frekuensi</TableHead>
              <TableHead className="hidden lg:table-cell">Terbit Berikutnya</TableHead>
              <TableHead className="hidden xl:table-cell">Sudah Terbit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Belum ada template. Buat yang pertama untuk mulai otomasi tagihan.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {nameById.get(t.clientId) ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{FREQ_LABEL[t.frequency]}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate(t.nextIssueDate)}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                    {t._count.invoices}x
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.active ? "success" : "secondary"}>
                      {t.active ? "Aktif" : "Dipause"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <RecurringRowActions id={t.id} active={t.active} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
