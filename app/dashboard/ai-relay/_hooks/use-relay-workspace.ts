"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";

export function useRelayWorkspace(
  initialBalance: number,
  catalog: ModelCatalogItem[]
) {
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(tabFromQuery || "catalog");
  const [prevTabQuery, setPrevTabQuery] = useState(tabFromQuery);
  if (tabFromQuery !== prevTabQuery) {
    setPrevTabQuery(tabFromQuery);
    if (tabFromQuery) setActiveTab(tabFromQuery);
  }
  const [currentBalance, setCurrentBalance] = useState<number>(initialBalance);
  const [selectedPlaygroundModel, setSelectedPlaygroundModel] = useState<
    string | null
  >(null);
  const handleSelectPlaygroundModel = (modelId?: string) => {
    if (modelId) setSelectedPlaygroundModel(modelId);
    setActiveTab("playground");
  };
  const playgroundModels = useMemo(() => {
    if (!selectedPlaygroundModel) return catalog;
    const target = catalog.find((m) => m.id === selectedPlaygroundModel);
    if (!target) return catalog;
    return [
      target,
      ...catalog
        .filter((m) => m.id !== selectedPlaygroundModel)
        .map((m) =>
          m.id === "gpt-4o-mini" && selectedPlaygroundModel !== "gpt-4o-mini"
            ? { ...m, isActive: false }
            : m
        ),
    ];
  }, [catalog, selectedPlaygroundModel]);
  return {
    activeTab,
    setActiveTab,
    currentBalance,
    setCurrentBalance,
    selectedPlaygroundModel,
    playgroundModels,
    handleSelectPlaygroundModel,
  };
}
