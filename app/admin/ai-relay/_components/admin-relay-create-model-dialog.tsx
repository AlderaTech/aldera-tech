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
import type { AdminAiRelayState } from "../_hooks/use-admin-ai-relay";
export function AdminRelayCreateModelDialog({
  state,
}: {
  state: AdminAiRelayState;
}) {
  const {
    isPending,
    isAddModalOpen,
    setIsAddModalOpen,
    newModelName,
    setNewModelName,
    newDisplayName,
    setNewDisplayName,
    newInputPrice,
    setNewInputPrice,
    newOutputPrice,
    setNewOutputPrice,
    newUpstreamCost,
    setNewUpstreamCost,
    handleCreateModel,
  } = state;
  return (
    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Tambah Model Baru ke Katalog
          </DialogTitle>
          <DialogDescription className="text-xs">
            Masukkan spesifikasi model dan harga per 1,000,000 token dalam
            Rupiah.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <Label htmlFor="model_name" className="text-xs font-semibold">
              Model ID (Resmi API)
            </Label>
            <Input
              id="model_name"
              placeholder="misal: gpt-4.5-preview"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="display_name" className="text-xs font-semibold">
              Nama Display
            </Label>
            <Input
              id="display_name"
              placeholder="misal: GPT-4.5 Preview"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="input_price" className="text-xs font-semibold">
                Harga Jual Input / 1M
              </Label>
              <Input
                id="input_price"
                type="number"
                value={newInputPrice}
                onChange={(e) => setNewInputPrice(Number(e.target.value))}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="output_price" className="text-xs font-semibold">
                Harga Jual Output / 1M
              </Label>
              <Input
                id="output_price"
                type="number"
                value={newOutputPrice}
                onChange={(e) => setNewOutputPrice(Number(e.target.value))}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="upstream_cost" className="text-xs font-semibold">
              Estimasi Modal Upstream 9router / 1M
            </Label>
            <Input
              id="upstream_cost"
              type="number"
              value={newUpstreamCost}
              onChange={(e) => setNewUpstreamCost(Number(e.target.value))}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-3">
            <div>
              <span className="block text-[11px] font-semibold text-slate-700">
                Estimasi Gross Margin:
              </span>
              <span className="text-[10px] text-muted-foreground">
                (Harga Jual Input - Modal Upstream) / Harga Jual
              </span>
            </div>
            <Badge
              className={`font-mono text-xs ${
                calculateGrossMarginPercentage(
                  newInputPrice,
                  newUpstreamCost
                ) >= 30
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-600 text-white"
              }`}
            >
              {calculateGrossMarginPercentage(newInputPrice, newUpstreamCost)}%
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddModalOpen(false)}
            className="text-xs"
          >
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleCreateModel}
            disabled={isPending}
            className="bg-primary text-xs text-white hover:bg-primary/90"
          >
            Simpan & Aktifkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
