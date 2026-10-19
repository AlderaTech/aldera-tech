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
import { ADMIN_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { proposalStatusMeta } from "@/lib/status-meta";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProposalStatus, type Prisma } from "@prisma/client";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { DataPagination } from "@/components/shared/data-pagination";
import { ParamFilterSelect } from "@/components/shared/param-filter-select";

const proposalStatusOptions = [
  { label: "Semua Status", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Terkirim", value: "SENT" },
  { label: "Dilihat", value: "VIEWED" },
  { label: "Ditandatangani", value: "SIGNED" },
  { label: "Ditolak", value: "REJECTED" },
  { label: "Dikonversi", value: "CONVERTED" },
  { label: "Kedaluwarsa", value: "EXPIRED" },
];

export interface AdminProposalsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminProposalsPage({
  searchParams,
}: AdminProposalsPageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);
  const PAGE_SIZE = 10;
  const q = sp?.q?.trim();
  const rawStatus = sp?.status?.trim()?.toUpperCase();

  const where: Prisma.ProposalWhereInput = {};
  if (
    rawStatus &&
    rawStatus !== "ALL" &&
    Object.values(ProposalStatus).includes(rawStatus as ProposalStatus)
  ) {
    where.status = rawStatus as ProposalStatus;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { number: { contains: q, mode: "insensitive" } },
      { clientName: { contains: q, mode: "insensitive" } },
    ];
  }

  const [proposals, totalCount] = await safeDb(
    async () =>
      await Promise.all([
        prisma.proposal.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          include: {
            _count: { select: { items: true } },
          },
        }),
        prisma.proposal.count({ where }),
      ]),
    [[], 0]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <FileSignature className="size-6" />
            Proposal
          </h1>
          <p className="text-muted-foreground">
            Kirim proposal dengan e-signature. Setelah ditandatangani, konversi
            menjadi proyek.
          </p>
        </div>
        <Button asChild>
          <Link href={ADMIN_ROUTES.proposalNew}>
            <Plus className="size-4" /> Proposal Baru
          </Link>
        </Button>
      </div>

      <SearchFilterBar
        placeholder="Cari nomor proposal, judul, atau client..."
        searchParamKey="q"
      >
        <ParamFilterSelect
          paramKey="status"
          options={proposalStatusOptions}
          placeholder="Filter status..."
        />
      </SearchFilterBar>

      <Card className="overflow-hidden p-0">
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
                  className="py-10 text-center text-muted-foreground"
                >
                  Belum ada proposal atau tidak ada proposal yang sesuai
                  kriteria filter.
                </TableCell>
              </TableRow>
            ) : (
              proposals.map((p) => {
                const meta = proposalStatusMeta[p.status];
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={ADMIN_ROUTES.proposalDetail(p.id)}
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
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatCurrency(Number(p.totalAmount))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {formatDate(p.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <DataPagination
          currentPage={page}
          totalItems={totalCount}
          pageSize={PAGE_SIZE}
        />
      </Card>
    </div>
  );
}
