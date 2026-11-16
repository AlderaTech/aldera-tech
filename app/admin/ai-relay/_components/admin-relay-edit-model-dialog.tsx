"use client";
import { Badge } from "@/components/ui/badge";
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
import { calculateGrossMarginPercentage } from "@/lib/ai-relay-utils";
import { formatCurrency } from "@/lib/utils";
import type { AdminAiRelayState } from "../_hooks/use-admin-ai-relay";
export function AdminRelayEditModelDialog({
  state,
}: {
  state: AdminAiRelayState;
}) {
  const {
    isPending,
    editingModel,
    setEditingModel,
    editDisplayName,
    setEditDisplayName,
    editInputPrice,
    setEditInputPrice,
    editOutputPrice,
    setEditOutputPrice,
    editUpstreamCost,
    setEditUpstreamCost,
    handleSaveEdit,
  } = state;
  return (
    <Dialog
      open={Boolean(editingModel)}
      onOpenChange={(open) => !open && setEditingModel(null)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Edit Harga Model: {editingModel?.model_name}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Perbarui harga per 1M token dan nama display model.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Nama Display</Label>
            <Input
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Harga Input / 1M</Label>
              <Input
                type="number"
                value={editInputPrice}
                onChange={(e) => setEditInputPrice(Number(e.target.value))}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Harga Output / 1M</Label>
              <Input
                type="number"
                value={editOutputPrice}
                onChange={(e) => setEditOutputPrice(Number(e.target.value))}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">
              Estimasi Modal Upstream / 1M
            </Label>
            <Input
              type="number"
              value={editUpstreamCost}
              onChange={(e) => setEditUpstreamCost(Number(e.target.value))}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-3">
            <div>
              <span className="block text-[11px] font-semibold text-slate-700">
                Gross Margin Input Baru:
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                Modal upstream: {formatCurrency(editUpstreamCost)}
              </span>
            </div>
            <Badge
              className={`font-mono text-xs ${
                calculateGrossMarginPercentage(
                  editInputPrice,
                  editUpstreamCost
                ) >= 30
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-600 text-white"
              }`}
            >
              {calculateGrossMarginPercentage(editInputPrice, editUpstreamCost)}
              %
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingModel(null)}
            className="text-xs"
          >
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleSaveEdit}
            disabled={isPending}
            className="bg-primary text-xs text-white hover:bg-primary/90"
          >
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
