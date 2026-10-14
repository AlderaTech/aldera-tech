/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, FileSignature, UserRound } from "lucide-react";

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
import { proposalStatusMeta } from "@/lib/status-meta";
import { ADMIN_ROUTES } from "@/lib/routes";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProposalActions } from "../_components/proposal-actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProposalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const proposal = await safeDb(
    async () =>
      await prisma.proposal.findUnique({
        where: { id },
        include: {
          items: { orderBy: { order: "asc" } },
          createdBy: { select: { name: true } },
          convertedProject: { select: { id: true, title: true } },
        },
      }),
    null
  );

  if (!proposal) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const publicUrl = `${appUrl}/proposal/${proposal.token}`;
  const meta = proposalStatusMeta[proposal.status];
  const subtotal = proposal.items.reduce(
    (sum, item) => sum + Number(item.total),
    0
  );
  const taxAmount = Number(proposal.totalAmount) - subtotal;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href={ADMIN_ROUTES.proposals}>
              <ArrowLeft className="size-4" /> Kembali ke Proposal
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {proposal.number}
            </h1>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </div>
          <p className="text-muted-foreground">{proposal.title}</p>
        </div>
        <ProposalActions
          proposalId={proposal.id}
          publicUrl={publicUrl}
          status={proposal.status}
          convertedProjectId={proposal.convertedProjectId}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-2 p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <UserRound className="size-4" />
            Client
          </div>
          <div className="text-lg font-semibold">{proposal.clientName}</div>
          <div className="text-sm text-muted-foreground">
            {proposal.clientEmail}
          </div>
        </Card>
        <Card className="space-y-2 p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="size-4" />
            Timeline
          </div>
          <div className="text-sm text-muted-foreground">
            Dibuat oleh {proposal.createdBy.name} pada{" "}
            {formatDate(proposal.createdAt)}
          </div>
          {proposal.sentAt && (
            <div className="text-sm text-muted-foreground">
              Dikirim: {formatDate(proposal.sentAt)}
            </div>
          )}
          {proposal.viewedAt && (
            <div className="text-sm text-muted-foreground">
              Dilihat: {formatDate(proposal.viewedAt)}
            </div>
          )}
          {proposal.expiresAt && (
            <div className="text-sm text-muted-foreground">
              Expired: {formatDate(proposal.expiresAt)}
            </div>
          )}
        </Card>
        <Card className="space-y-2 p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileSignature className="size-4" />
            Signature
          </div>
          {proposal.signedAt ? (
            <>
              <div className="text-sm text-muted-foreground">
                Ditandatangani oleh {proposal.signatureName}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(proposal.signedAt)}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Belum ditandatangani.
            </div>
          )}
          {proposal.convertedProject && (
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link
                href={ADMIN_ROUTES.projectDetail(proposal.convertedProject.id)}
              >
                Lihat Proyek
              </Link>
            </Button>
          )}
        </Card>
      </div>

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="text-lg font-semibold">Ringkasan</h2>
          <p className="text-muted-foreground">
            {proposal.summary || "Tidak ada ringkasan."}
          </p>
        </div>
        <div
          className="prose max-w-none prose-neutral"
          dangerouslySetInnerHTML={{ __html: proposal.content }}
        />
      </Card>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="w-28 text-right">Qty</TableHead>
              <TableHead className="w-40 text-right">Harga</TableHead>
              <TableHead className="w-40 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposal.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {Number(item.quantity).toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(Number(item.price))}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(Number(item.total))}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-right text-muted-foreground"
              >
                Pajak ({Number(proposal.taxRate).toLocaleString("id-ID")}%)
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(taxAmount)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">
                Total
              </TableCell>
              <TableCell className="text-right text-lg font-bold tabular-nums">
                {formatCurrency(Number(proposal.totalAmount))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {proposal.signatureDataUrl && (
        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-semibold">Bukti Tanda Tangan</h2>
          <img
            src={proposal.signatureDataUrl}
            alt="Signature"
            className="h-28 max-w-full rounded-md border bg-white object-contain p-3"
          />
          <div className="text-xs text-muted-foreground">
            IP: {proposal.signatureIp ?? "-"} · User agent:{" "}
            {proposal.signatureUserAgent ?? "-"}
          </div>
        </Card>
      )}
    </div>
  );
}
