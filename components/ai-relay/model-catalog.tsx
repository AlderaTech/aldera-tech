"use client";

import { useState } from "react";
import { Check, Code2, Copy, Layers, Play, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  filterModelCatalog,
  type ApiKeyRecord,
  type ModelCatalogItem,
  type ModelCategory,
} from "@/lib/ai-relay-utils";
import { PresetConfigModal } from "./preset-config-modal";
import { formatCurrency } from "@/lib/utils";

interface ModelCatalogProps {
  catalog: ModelCatalogItem[];
  apiKeys: ApiKeyRecord[];
  onSelectPlaygroundModel?: (modelId: string) => void;
}

const CATEGORIES: ModelCategory[] = [
  "All",
  "Coding",
  "Reasoning",
  "Vision",
  "Fast",
  "Budget",
];

export function ModelCatalog({
  catalog,
  apiKeys,
  onSelectPlaygroundModel,
}: ModelCatalogProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<ModelCategory>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Preset modal state
  const [presetModalModelId, setPresetModalModelId] = useState<string | null>(
    null
  );

  const filteredModels = filterModelCatalog(catalog, {
    category: selectedCategory,
    search: searchQuery,
    activeOnly: true,
  });

  const handleCopyModelId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success(`Model ID '${id}' disalin!`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Gagal menyalin Model ID.");
    }
  };

  const getCategoryBadgeClass = (category: ModelCategory) => {
    switch (category) {
      case "Coding":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Reasoning":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Vision":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Fast":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Budget":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Button
                key={cat}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`h-8 rounded-full px-3 text-xs ${
                  isSelected
                    ? "bg-indigo-600 font-semibold text-white hover:bg-indigo-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {cat}
              </Button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari model, ID, atau kegunaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 bg-white pl-8 text-xs"
          />
        </div>
      </div>

      {/* Grid of Model Cards */}
      {filteredModels.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-14 text-center">
          <Layers className="mb-2 h-8 w-8 text-slate-300" />
          <h3 className="text-sm font-semibold text-slate-800">
            Tidak ada model yang cocok
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Coba ubah kata kunci pencarian atau pilih kategori lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredModels.map((model) => (
            <Card
              key={model.id}
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
                      className={`shrink-0 text-[10px] font-semibold ${getCategoryBadgeClass(
                        model.category
                      )}`}
                    >
                      {model.category}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <code className="max-w-[200px] truncate rounded border border-slate-200/80 bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-600">
                      {model.id}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyModelId(model.id)}
                      className="h-6 w-6 text-slate-400 hover:text-indigo-600"
                      title="Salin Model ID"
                    >
                      {copiedId === model.id ? (
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
                  onClick={() => setPresetModalModelId(model.id)}
                  className="h-8 flex-1 gap-1.5 border-indigo-200 text-xs text-indigo-700 hover:bg-indigo-50"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  Gunakan di IDE
                </Button>

                {onSelectPlaygroundModel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectPlaygroundModel(model.id)}
                    className="h-8 gap-1 text-xs text-slate-600 hover:text-slate-900"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Playground
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Preset Config Generator Modal */}
      {presetModalModelId && (
        <PresetConfigModal
          isOpen={!!presetModalModelId}
          onClose={() => setPresetModalModelId(null)}
          modelId={presetModalModelId}
          activeApiKeys={apiKeys}
        />
      )}
    </div>
  );
}
