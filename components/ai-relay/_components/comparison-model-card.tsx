import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
export function ComparisonModelCard({
  label,
  modelId,
  onModelChange,
  activeModels,
  model,
  placeholder = "Pilih Model A",
}: {
  label: string;
  modelId: string;
  onModelChange: (id: string) => void;
  activeModels: ModelCatalogItem[];
  model?: ModelCatalogItem;
  placeholder?: string;
}) {
  const selectId = useId();
  return (
    <div className="space-y-3 rounded-xl border bg-slate-50/60 p-4">
      <div className="space-y-1.5">
        <Label
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-700"
        >
          {label}
        </Label>
        <Select value={modelId} onValueChange={onModelChange}>
          <SelectTrigger
            id={selectId}
            className="h-9 bg-white text-xs font-medium"
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {activeModels.map((m) => (
              <SelectItem key={m.id} value={m.id} className="text-xs">
                {m.displayName} ({m.category})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {model && (
        <div className="space-y-2 pt-1 text-xs">
          <div className="flex justify-between border-b pb-1.5">
            <span className="text-slate-500">Kategori:</span>
            <Badge variant="outline" className="text-[10px]">
              {model.category}
            </Badge>
          </div>
          <div className="flex justify-between border-b pb-1.5">
            <span className="text-slate-500">Harga Input:</span>
            <span className="font-mono font-semibold text-slate-900">
              {formatCurrency(model.inputPricePerM)} / 1M
            </span>
          </div>
          <div className="flex justify-between border-b pb-1.5">
            <span className="text-slate-500">Harga Output:</span>
            <span className="font-mono font-semibold text-slate-900">
              {formatCurrency(model.outputPricePerM)} / 1M
            </span>
          </div>
          <div className="flex justify-between border-b pb-1.5">
            <span className="text-slate-500">Context Window:</span>
            <span className="font-mono">
              {model.contextWindow.toLocaleString("id-ID")} token
            </span>
          </div>
          <div className="pt-1">
            <span className="mb-0.5 block text-slate-500">Rekomendasi:</span>
            <p className="text-slate-700 italic">
              &ldquo;{model.bestFor}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
