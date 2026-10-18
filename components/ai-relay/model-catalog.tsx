"use client";
import type { ReactNode } from "react";
import { Layers, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ApiKeyRecord,
  ModelCatalogItem,
  ModelCategory,
} from "@/lib/ai-relay-utils";
import { PresetConfigModal } from "./preset-config-modal";
import { ModelCatalogCard } from "./_components/model-catalog-card";
import { useModelCatalog } from "./_hooks/use-model-catalog";
interface ModelCatalogProps {
  catalog: ModelCatalogItem[];
  apiKeys: ApiKeyRecord[];
  onSelectPlaygroundModel?: (modelId: string) => void;
  ideIllustration?: ReactNode;
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
  ideIllustration,
}: ModelCatalogProps) {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    copiedId,
    presetModalModelId,
    setPresetModalModelId,
    filteredModels,
    handleCopyModelId,
  } = useModelCatalog(catalog);
  return (
    <div className="space-y-6" data-relay-catalog>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              type="button"
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              className={
                selectedCategory === cat
                  ? "h-8 rounded-full bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700"
                  : "h-8 rounded-full px-3 text-xs text-slate-700 hover:bg-slate-100"
              }
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
          <Input
            aria-label="Cari model, ID, atau kegunaan"
            placeholder="Cari model, ID, atau kegunaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 bg-white pl-8 text-xs"
          />
        </div>
      </div>
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
        <div
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          data-relay-model-grid
        >
          {filteredModels.map((model) => (
            <ModelCatalogCard
              key={model.id}
              model={model}
              copied={copiedId === model.id}
              onCopy={handleCopyModelId}
              onConfigure={setPresetModalModelId}
              onPlayground={onSelectPlaygroundModel}
            />
          ))}
        </div>
      )}
      {presetModalModelId && (
        <PresetConfigModal
          illustration={ideIllustration}
          isOpen={!!presetModalModelId}
          onClose={() => setPresetModalModelId(null)}
          modelId={presetModalModelId}
          activeApiKeys={apiKeys}
        />
      )}
    </div>
  );
}
