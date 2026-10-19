"use client";

import { useCallback, useMemo, useState } from "react";
import { useUrlState } from "@/lib/hooks/use-url-state";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";

export const VALID_RELAY_TABS = [
  "catalog",
  "playground",
  "keys",
  "billing",
  "telegram",
  "analytics",
  "simulator",
  "health",
] as const;

export type RelayTabKey = (typeof VALID_RELAY_TABS)[number];

const TAB_ALIASES: Record<string, RelayTabKey> = {
  overview: "catalog",
  tokens: "keys",
  presets: "simulator",
};

export function resolveRelayTab(tab?: string | null): string {
  if (!tab) return "catalog";
  const normalized = tab.toLowerCase();
  if (normalized in TAB_ALIASES) {
    return TAB_ALIASES[normalized];
  }
  return normalized;
}

export function useRelayWorkspace(
  initialBalance: number,
  catalog: ModelCatalogItem[]
) {
  const { getParam, setParam } = useUrlState();
  const tabFromQuery = getParam("tab", "catalog");
  const activeTab = resolveRelayTab(tabFromQuery);

  const setActiveTab = useCallback(
    (nextTab: string) => {
      setParam("tab", nextTab);
    },
    [setParam]
  );

  const [currentBalance, setCurrentBalance] = useState<number>(initialBalance);
  const [selectedPlaygroundModel, setSelectedPlaygroundModel] = useState<
    string | null
  >(null);

  const handleSelectPlaygroundModel = useCallback(
    (modelId?: string) => {
      if (modelId) setSelectedPlaygroundModel(modelId);
      setParam("tab", "playground");
    },
    [setParam]
  );

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
