"use client";
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
export function AdminRelayPaymentProofDialog({
  state,
}: {
  state: AdminAiRelayState;
}) {
  const { viewProofTicket, setViewProofTicket } = state;
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
            ID Berkas Bukti: {viewProofTicket?.proof_file_id}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 text-center">
          {viewProofTicket?.proof_file_id ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border bg-slate-50 p-4">
              <div className="relative flex max-h-72 w-full items-center justify-center overflow-hidden rounded-md border bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    viewProofTicket.proof_file_id.startsWith("/") ||
                    viewProofTicket.proof_file_id.startsWith("http")
                      ? viewProofTicket.proof_file_id
                      : API_ROUTES.fileDownload(viewProofTicket.proof_file_id)
                  }
                  alt="Bukti Transfer"
                  className="max-h-64 rounded object-contain"
                />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="font-mono text-xs text-slate-700">
                  {viewProofTicket.proof_file_id}
                </span>
                <a
                  href={
                    viewProofTicket.proof_file_id.startsWith("/") ||
                    viewProofTicket.proof_file_id.startsWith("http")
                      ? viewProofTicket.proof_file_id
                      : API_ROUTES.fileDownload(viewProofTicket.proof_file_id)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline"
                >
                  Buka Berkas Penuh &rarr;
                </a>
              </div>
            </div>
          ) : null}
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
