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
import { formatCurrency } from "@/lib/utils";
import type { AdminAiRelayState } from "../_hooks/use-admin-ai-relay";
export function AdminRelayApproveTopupDialog({
  state,
}: {
  state: AdminAiRelayState;
}) {
  const {
    isPending,
    approvingTicket,
    setApprovingTicket,
    handleConfirmApprove,
  } = state;
  return (
    <Dialog
      open={Boolean(approvingTicket)}
      onOpenChange={(open) => !open && setApprovingTicket(null)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-emerald-800">
            Setujui Tiket Top-up #{approvingTicket?.id}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Konfirmasi persetujuan transfer dana pengguna. Saldo akan otomatis
            ditambahkan ke akun pengguna secara atomik.
          </DialogDescription>
        </DialogHeader>

        {approvingTicket && (
          <div className="space-y-2 py-2 text-xs">
            <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Pengguna:</span>
                <span className="font-semibold text-slate-900">
                  {approvingTicket.user_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Nominal Pokok:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(approvingTicket.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Kode Unik:</span>
                <span className="font-mono font-bold text-amber-700">
                  +{approvingTicket.unique_code}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold text-slate-700">
                  Total Transfer Wajib:
                </span>
                <span className="font-mono text-sm font-extrabold text-emerald-700">
                  {formatCurrency(approvingTicket.total_transfer)}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setApprovingTicket(null)}
            className="text-xs"
          >
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmApprove}
            disabled={isPending}
            className="bg-emerald-600 text-xs text-white hover:bg-emerald-700"
          >
            Ya, Setujui & Tambah Saldo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
