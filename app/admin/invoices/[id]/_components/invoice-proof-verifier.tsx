"use client";

import * as React from "react";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { InvoiceStatus } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import {
  verifyPaymentProofAction,
  rejectPaymentProofAction,
} from "@/lib/actions/invoice";

export type InvoiceProofVerifierProps = {
  invoiceId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  paymentProofUrl: string | null;
  paymentMethod: string | null;
  payment?: {
    status: string;
    notes: string | null;
    proofUploadedAt: Date | null;
    createdAt: Date;
    rejectionReason?: string | null;
  } | null;
};

export function InvoiceProofVerifier({
  invoiceId,
  invoiceNumber,
  status,
  paymentProofUrl,
  paymentMethod,
  payment,
}: InvoiceProofVerifierProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");

  if (!paymentProofUrl && !payment) return null;

  const handleVerify = () => {
    startTransition(async () => {
      try {
        const res = await verifyPaymentProofAction(invoiceId);
        if (res.ok) {
          toast.success(res.message || "Pembayaran diverifikasi lunas");
          router.refresh();
        } else {
          toast.error(res.message || "Gagal verifikasi pembayaran");
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
      }
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Mohon masukkan alasan penolakan bukti pembayaran");
      return;
    }

    startTransition(async () => {
      try {
        const res = await rejectPaymentProofAction(
          invoiceId,
          rejectionReason.trim()
        );
        if (res.ok) {
          toast.success(res.message || "Bukti pembayaran ditolak");
          setRejectDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.message || "Gagal menolak bukti");
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
      }
    });
  };

  const isPdf = paymentProofUrl?.endsWith(".pdf");

  return (
    <>
      <Card className="space-y-3 border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Receipt className="size-4 text-primary" />
            Bukti Transfer
          </div>
          {status === "PENDING_VERIFICATION" && (
            <Badge variant="warning" className="text-xs">
              Menunggu Review
            </Badge>
          )}
          {status === "PAID" && (
            <Badge variant="success" className="text-xs">
              Terverifikasi
            </Badge>
          )}
        </div>

        {paymentProofUrl && (
          <div className="space-y-2">
            {!isPdf ? (
              <div className="relative h-48 w-full overflow-hidden rounded-md border bg-slate-50">
                <Image
                  src={paymentProofUrl}
                  alt={`Bukti transfer ${invoiceNumber}`}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="rounded-md border bg-slate-50 p-3 text-center text-xs text-muted-foreground">
                Dokumen Bukti Transfer (PDF)
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full gap-1.5 text-xs"
              asChild
            >
              <a
                href={paymentProofUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-3.5" /> Buka Bukti Penuh
              </a>
            </Button>
          </div>
        )}

        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Metode:</span>
            <span className="font-medium text-slate-900">
              {paymentMethod ?? "MANUAL_TRANSFER"}
            </span>
          </div>
          {payment?.proofUploadedAt && (
            <div className="flex justify-between">
              <span>Waktu Upload:</span>
              <span className="text-slate-900">
                {formatDate(payment.proofUploadedAt)}
              </span>
            </div>
          )}
          {payment?.notes && (
            <div className="pt-1">
              <span className="text-slate-500">Catatan Klien:</span>
              <p className="mt-0.5 rounded bg-slate-50 p-1.5 text-slate-800 italic">
                &ldquo;{payment.notes}&rdquo;
              </p>
            </div>
          )}
          {payment?.rejectionReason && (
            <div className="pt-1">
              <span className="font-medium text-destructive">
                Alasan Ditolak Sebelumnya:
              </span>
              <p className="mt-0.5 rounded bg-rose-50 p-1.5 text-rose-800">
                {payment.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {status === "PENDING_VERIFICATION" && (
          <div className="flex gap-2 border-t pt-2">
            <Button
              size="sm"
              className="h-8 flex-1 gap-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
              disabled={isPending}
              onClick={handleVerify}
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              Setujui (Lunas)
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 border-destructive/30 text-xs text-destructive hover:bg-destructive/10"
              disabled={isPending}
              onClick={() => setRejectDialogOpen(true)}
            >
              <XCircle className="size-3.5" />
              Tolak
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak Bukti Pembayaran</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan agar klien dapat memperbaiki atau
              mengunggah ulang bukti transfer yang benar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="reject-reason">Alasan Penolakan</Label>
            <Textarea
              id="reject-reason"
              placeholder="Contoh: Nominal transfer tidak sesuai, atau bukti mutasi tidak terbaca jelas."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setRejectDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={isPending || !rejectionReason.trim()}
              onClick={handleReject}
            >
              {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Tolak Bukti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
