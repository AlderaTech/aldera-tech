"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useUrlState } from "@/lib/hooks/use-url-state";
import {
  calculateMonthlyCost,
  filterModelCatalog,
  generateIdePresetConfig,
  type IdeTarget,
  type ModelCatalogItem,
  type ModelCategory,
} from "@/lib/ai-relay-utils";
import { RELAY_BASE_URL } from "../_data/relay-content";

export const VALID_RELAY_CATEGORIES: readonly ModelCategory[] = [
  "All",
  "Coding",
  "Reasoning",
  "Vision",
  "Fast",
  "Budget",
];

export const VALID_IDE_TARGETS: readonly IdeTarget[] = [
  "cursor",
  "cline",
  "roo",
  "continue",
  "openwebui",
];

function parseCategory(raw?: string | null): ModelCategory {
  if (!raw) return "All";
  const match = VALID_RELAY_CATEGORIES.find(
    (c) => c.toLowerCase() === raw.toLowerCase()
  );
  return match ?? "All";
}

function parseIde(raw?: string | null): IdeTarget {
  if (!raw) return "cursor";
  const match = VALID_IDE_TARGETS.find(
    (i) => i.toLowerCase() === raw.toLowerCase()
  );
  return match ?? "cursor";
}

export function useRelayShowcase(initialCatalog: ModelCatalogItem[]) {
  const { getParam, setParam } = useUrlState();

  const categoryParam = getParam("category", "All");
  const qParam = getParam("q", "");
  const ideParam = getParam("ide", "cursor");

  const selectedCategory = parseCategory(categoryParam);
  const selectedIde = parseIde(ideParam);

  const [searchQuery, setSearchQuery] = useState<string>(qParam);
  const [prevQParam, setPrevQParam] = useState<string>(qParam);

  // Sync external changes to q parameter without calling setState inside an effect
  if (qParam !== prevQParam) {
    setPrevQParam(qParam);
    setSearchQuery(qParam);
  }

  const setSelectedCategory = useCallback(
    (category: ModelCategory) => {
      setParam("category", category === "All" ? null : category);
    },
    [setParam]
  );

  const setSelectedIde = useCallback(
    (ide: IdeTarget) => {
      setParam("ide", ide);
    },
    [setParam]
  );

  // Debounce search query update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== qParam) {
        setParam("q", searchQuery || null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, qParam, setParam]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const activeModels = filterModelCatalog(initialCatalog, {
    category: selectedCategory,
    search: searchQuery,
    activeOnly: true,
  });

  const [quickstartModelId, setQuickstartModelId] = useState(
    initialCatalog.find((m) => m.isActive)?.id || "claude-3-5-sonnet-20241022"
  );
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [simModelAId, setSimModelAId] = useState(
    initialCatalog.find((m) => m.id === "claude-3-5-sonnet-20241022")?.id ||
      initialCatalog[0]?.id ||
      ""
  );
  const [simModelBId, setSimModelBId] = useState(
    initialCatalog.find((m) => m.id === "deepseek-chat")?.id ||
      initialCatalog[1]?.id ||
      ""
  );
  const [dailyRequests, setDailyRequests] = useState(100);
  const [avgPromptTokens, setAvgPromptTokens] = useState(2000);
  const [avgCompletionTokens, setAvgCompletionTokens] = useState(500);

  const modelA = initialCatalog.find((m) => m.id === simModelAId);
  const modelB = initialCatalog.find((m) => m.id === simModelBId);
  const costA = modelA
    ? calculateMonthlyCost(
        dailyRequests,
        avgPromptTokens,
        avgCompletionTokens,
        modelA.inputPricePerM,
        modelA.outputPricePerM
      )
    : 0;
  const costB = modelB
    ? calculateMonthlyCost(
        dailyRequests,
        avgPromptTokens,
        avgCompletionTokens,
        modelB.inputPricePerM,
        modelB.outputPricePerM
      )
    : 0;
  const costDiff = Math.abs(costA - costB);
  const higherModel =
    costA >= costB ? modelA?.displayName : modelB?.displayName;
  const lowerModel = costA >= costB ? modelB?.displayName : modelA?.displayName;
  const higherCost = Math.max(costA, costB);
  const savingsPercent =
    higherCost > 0 ? Math.round((costDiff / higherCost) * 100) : 0;

  const handleCopyModelId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success(`Model ID '${id}' berhasil disalin!`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Gagal menyalin Model ID");
    }
  };

  const handleSelectModelForQuickstart = (modelId: string) => {
    setQuickstartModelId(modelId);
    document.getElementById("quickstart-guide")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  const generatedIdeConfig = generateIdePresetConfig(selectedIde, {
    apiKey: "sk-toko-YOUR_API_KEY",
    baseUrl: RELAY_BASE_URL,
    modelId: quickstartModelId,
  });

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(generatedIdeConfig);
      setCopiedConfig(true);
      toast.success(
        `Konfigurasi ${selectedIde.toUpperCase()} berhasil disalin!`
      );
      setTimeout(() => setCopiedConfig(false), 2000);
    } catch {
      toast.error("Gagal menyalin snippet konfigurasi");
    }
  };

  return {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    activeModels,
    copiedId,
    handleCopyModelId,
    handleSelectModelForQuickstart,
    selectedIde,
    setSelectedIde,
    quickstartModelId,
    setQuickstartModelId,
    copiedConfig,
    generatedIdeConfig,
    handleCopyConfig,
    simModelAId,
    setSimModelAId,
    simModelBId,
    setSimModelBId,
    dailyRequests,
    setDailyRequests,
    avgPromptTokens,
    setAvgPromptTokens,
    avgCompletionTokens,
    setAvgCompletionTokens,
    costA,
    costB,
    costDiff,
    higherModel,
    lowerModel,
    savingsPercent,
  };
}

export type RelayShowcaseState = ReturnType<typeof useRelayShowcase>;
