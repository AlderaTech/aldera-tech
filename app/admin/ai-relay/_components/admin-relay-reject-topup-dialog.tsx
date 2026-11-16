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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminAiRelayState } from "../_hooks/use-admin-ai-relay";
export function AdminRelayRejectTopupDialog({
  state,
}: {
  state: AdminAiRelayState;
}) {
  const {
    isPending,
    rejectingTicket,
    setRejectingTicket,
    rejectReason,
    setRejectReason,
    handleConfirmReject,
  } = state;
  return (
    <Dialog
      open={Boolean(rejectingTicket)}
      onOpenChange={(open) => !open && setRejectingTicket(null)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-rose-800">
            Tolak Tiket Top-up #{rejectingTicket?.id}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Tiket ini akan ditandai sebagai ditolak (`rejected`) dan saldo tidak
            akan ditambahkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">
              Alasan Penolakan (Opsional)
            </Label>
            <Input
              placeholder="misal: Bukti transfer tidak valid atau dana belum masuk"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRejectingTicket(null)}
            className="text-xs"
          >
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmReject}
            disabled={isPending}
            className="bg-rose-600 text-xs text-white hover:bg-rose-700"
          >
            Konfirmasi Tolak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
