"use client";
import { useState } from "react";
import {
  calculateMonthlyCost,
  type ModelCatalogItem,
} from "@/lib/ai-relay-utils";
export function useCostSimulator(catalog: ModelCatalogItem[]) {
  const activeModels = catalog.filter((m) => m.isActive);

  // Model selection for comparison
  const [modelAId, setModelAId] = useState<string>(
    activeModels.find((m) => m.id === "claude-3-5-sonnet-20241022")?.id ||
      activeModels[0]?.id ||
      ""
  );
  const [modelBId, setModelBId] = useState<string>(
    activeModels.find((m) => m.id === "deepseek-chat")?.id ||
      activeModels[1]?.id ||
      ""
  );

  // Simulator parameters
  const [dailyRequests, setDailyRequests] = useState<number>(100);
  const [avgPromptTokens, setAvgPromptTokens] = useState<number>(2000);
  const [avgCompletionTokens, setAvgCompletionTokens] = useState<number>(500);

  const modelA = catalog.find((m) => m.id === modelAId);
  const modelB = catalog.find((m) => m.id === modelBId);

  // Calculations
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

  return {
    activeModels,
    modelAId,
    setModelAId,
    modelBId,
    setModelBId,
    dailyRequests,
    setDailyRequests,
    avgPromptTokens,
    setAvgPromptTokens,
    avgCompletionTokens,
    setAvgCompletionTokens,
    modelA,
    modelB,
    costA,
    costB,
    costDiff,
    higherModel,
    lowerModel,
    savingsPercent,
  };
}
