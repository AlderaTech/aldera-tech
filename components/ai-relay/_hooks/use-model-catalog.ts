"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  filterModelCatalog,
  type ModelCatalogItem,
  type ModelCategory,
} from "@/lib/ai-relay-utils";
export function useModelCatalog(catalog: ModelCatalogItem[]) {
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

  return {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    copiedId,
    presetModalModelId,
    setPresetModalModelId,
    filteredModels,
    handleCopyModelId,
  };
}
