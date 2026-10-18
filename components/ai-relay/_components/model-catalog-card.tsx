import { Check, Code2, Copy, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ModelCatalogItem, ModelCategory } from "@/lib/ai-relay-utils";
import { cn, formatCurrency } from "@/lib/utils";
const CATEGORY_CLASSES: Partial<Record<ModelCategory, string>> = {
  Coding: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Reasoning: "bg-purple-50 text-purple-700 border-purple-200",
  Vision: "bg-blue-50 text-blue-700 border-blue-200",
  Fast: "bg-amber-50 text-amber-700 border-amber-200",
  Budget: "bg-emerald-50 text-emerald-700 border-emerald-200",
};
export function ModelCatalogCard({
  model,
  copied,
  onCopy,
  onConfigure,
  onPlayground,
}: {
  model: ModelCatalogItem;
  copied: boolean;
  onCopy: (id: string) => void;
  onConfigure: (id: string) => void;
  onPlayground?: (id: string) => void;
}) {
  return (
    <Card
      data-relay-model-card
      className="flex flex-col justify-between border shadow-xs transition-colors hover:border-indigo-300"
    >
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug font-bold text-slate-900">
              {model.displayName}
            </CardTitle>
            <Badge
              variant="secondary"
              className={cn(
                "shrink-0 text-[10px] font-semibold",
                CATEGORY_CLASSES[model.category] ||
                  "border-slate-200 bg-slate-50 text-slate-700"
              )}
            >
              {model.category}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <code
              title={model.id}
              className="max-w-[200px] truncate rounded border border-slate-200/80 bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-600"
            >
              {model.id}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCopy(model.id)}
              className="h-6 w-6 text-slate-400 hover:text-indigo-600"
              title="Salin Model ID"
              aria-label={`Salin ID model ${model.displayName}`}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 text-xs">
          <div className="space-y-1.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Harga Input:</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatCurrency(model.inputPricePerM)} / 1M token
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Harga Output:</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatCurrency(model.outputPricePerM)} / 1M token
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-1">
              <span className="text-slate-500">Batas Konteks:</span>
              <span className="font-mono font-medium text-slate-700">
                {model.contextWindow.toLocaleString("id-ID")} token
              </span>
            </div>
          </div>
          <div>
            <span className="mb-1 block text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Rekomendasi Kegunaan:
            </span>
            <p className="text-xs leading-relaxed text-slate-600 italic">
              &ldquo;{model.bestFor}&rdquo;
            </p>
          </div>
        </CardContent>
      </div>
      <CardFooter className="flex items-center justify-between gap-2 border-t bg-slate-50/50 pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onConfigure(model.id)}
          className="h-8 flex-1 gap-1.5 border-indigo-200 text-xs text-indigo-700 hover:bg-indigo-50"
        >
          <Code2 className="h-3.5 w-3.5" />
          Gunakan di IDE
        </Button>
        {onPlayground && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPlayground(model.id)}
            className="h-8 gap-1 text-xs text-slate-600 hover:text-slate-900"
          >
            <Play className="h-3.5 w-3.5" />
            Playground
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
