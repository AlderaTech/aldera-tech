"use client";
import type { ReactNode } from "react";
import { Layers } from "lucide-react";
import type { ApiKeyRecord, ModelCatalogItem } from "@/lib/ai-relay-utils";
import { PresetConfigModal } from "./preset-config-modal";
import { ModelCatalogCard } from "./_components/model-catalog-card";
import { ModelCatalogToolbar } from "./_components/model-catalog-toolbar";
import { useModelCatalog } from "./_hooks/use-model-catalog";
interface ModelCatalogProps {
  catalog: ModelCatalogItem[];
  apiKeys: ApiKeyRecord[];
  onSelectPlaygroundModel?: (modelId: string) => void;
  ideIllustration?: ReactNode;
}
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
      <ModelCatalogToolbar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
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
