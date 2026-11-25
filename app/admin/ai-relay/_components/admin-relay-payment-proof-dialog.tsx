"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { API_ROUTES } from "@/lib/routes";
import type { AdminAiRelayState } from "../_hooks/use-admin-ai-relay";

function TransferProof({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/40 p-4">
      {failed ? (
        <div className="space-y-2 py-4" role="status">
          <p className="text-sm text-muted-foreground">
            Bukti transfer belum bisa ditampilkan.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFailed(false)}
          >
            Muat ulang
          </Button>
        </div>
      ) : (
        <>
          {/* The authenticated proof URL must receive the admin's session cookie. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Bukti transfer pelanggan"
            className="max-h-64 max-w-full rounded object-contain"
            onError={() => setFailed(true)}
          />
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-medium text-primary hover:underline"
          >
            Buka ukuran penuh
          </a>
        </>
      )}
    </div>
  );
}

export function AdminRelayPaymentProofDialog({
  state,
}: {
  state: AdminAiRelayState;
}) {
  const { viewProofTicket, setViewProofTicket } = state;
  const reference = viewProofTicket?.proof_file_id;
  const src =
    viewProofTicket && reference
      ? reference.startsWith("/") || /^https?:\/\//.test(reference)
        ? reference
        : API_ROUTES.adminRelayTopupProof(viewProofTicket.id)
      : null;
  return (
    <Dialog
      open={Boolean(viewProofTicket)}
      onOpenChange={(open) => !open && setViewProofTicket(null)}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Bukti Transfer Tiket #{viewProofTicket?.id}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Cocokkan nominal dan kode unik dengan mutasi rekening.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 text-center">
          {src && <TransferProof key={src} src={src} />}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewProofTicket(null)}
            className="text-xs"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
