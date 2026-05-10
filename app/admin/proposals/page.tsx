import Link from "next/link";
import { Plus, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { proposalStatusMeta } from "@/lib/status-meta";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminProposalsPage() {
  const proposals = await safeDb(
    async () =>
      await prisma.proposal.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { items: true } },
        },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileSignature className="size-6" />
            Proposal
          </h1>
          <p className="text-muted-foreground">
            Kirim proposal dengan e-signature. Setelah ditandatangani, konversi menjadi proyek.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/proposals/new">
            <Plus className="size-4" /> Proposal Baru
          </Link>
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Dibuat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Belum ada proposal. Buat yang pertama untuk mulai sales pipeline.
                </TableCell>
              </TableRow>
            ) : (
              proposals.map((p) => {
                const meta = proposalStatusMeta[p.status];
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/proposals/${p.id}`}
                        className="hover:underline"
                      >
                        {p.number}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {p.title}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm">{p.clientName}</div>
                      {p.clientCompany && (
                        <div className="text-xs text-muted-foreground">
                          {p.clientCompany}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatCurrency(Number(p.totalAmount))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(p.createdAt)}
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
