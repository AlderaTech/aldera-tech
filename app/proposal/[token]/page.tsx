/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { Calendar, FileSignature } from "lucide-react";

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
import { Logo } from "@/components/shared/logo";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { proposalStatusMeta } from "@/lib/status-meta";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { SignaturePanel } from "./signature-panel";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function PublicProposalPage({ params }: PageProps) {
  const { token } = await params;
  const proposal = await safeDb(
    async () =>
      await prisma.proposal.findUnique({
        where: { token },
        include: { items: { orderBy: { order: "asc" } } },
      }),
    null
  );

  if (!proposal) notFound();

  const isExpired = Boolean(
    proposal.expiresAt && proposal.expiresAt < new Date()
  );
  const status =
    isExpired && proposal.status !== "SIGNED" ? "EXPIRED" : proposal.status;
  const meta = proposalStatusMeta[status];
  const subtotal = proposal.items.reduce(
    (sum, item) => sum + Number(item.total),
    0
  );
  const taxAmount = Number(proposal.totalAmount) - subtotal;
  const canSign =
    !isExpired &&
    proposal.status !== "SIGNED" &&
    proposal.status !== "CONVERTED" &&
    proposal.status !== "REJECTED";

  return (
    <main className="min-h-svh bg-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Logo size="md" />
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground">
                  {proposal.number}
                </div>
                <h1 className="mt-1 text-3xl font-bold tracking-tight">
                  {proposal.title}
                </h1>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>Untuk {proposal.clientName}</div>
              </div>
            </div>
            {proposal.summary && (
              <p className="max-w-3xl text-muted-foreground">
                {proposal.summary}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-4" />
                Dibuat: {formatDate(proposal.createdAt)}
              </span>
              {proposal.expiresAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  Berlaku sampai: {formatDate(proposal.expiresAt)}
                </span>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div
              className="prose max-w-none prose-neutral"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(proposal.content),
              }}
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

          {proposal.signedAt ? (
            <Card className="space-y-3 p-6">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <FileSignature className="size-5" />
                Sudah Ditandatangani
              </div>
              <p className="text-sm text-muted-foreground">
                Ditandatangani oleh {proposal.signatureName} pada{" "}
                {formatDate(proposal.signedAt)}.
              </p>
              {proposal.signatureDataUrl && (
                <img
                  src={proposal.signatureDataUrl}
                  alt="Signature"
                  className="h-28 max-w-full rounded-md border bg-white object-contain p-3"
                />
              )}
            </Card>
          ) : (
            <SignaturePanel token={proposal.token} disabled={!canSign} />
          )}
        </div>
      </div>
    </main>
  );
}
