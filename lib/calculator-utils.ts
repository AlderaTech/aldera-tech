/**
 * Pure calculation utilities for pricing calculator and order requests.
 */

export type OrderCalculationParams = {
  basePrice: number;
  dependentFields?: Array<{ value: number; pricePerUnit: number }>;
  featurePrices?: number[];
  customFeatureCount?: number;
  customFeaturePrice?: number;
  addOns?: Array<{ pricePerMonth: number; months: number }>;
  urgency?: "normal" | "urgent";
  urgencyMultiplier?: number;
};

export function calculateOrderTotal(params: OrderCalculationParams): number {
  let sum = Number(params.basePrice || 0);

  if (params.dependentFields && Array.isArray(params.dependentFields)) {
    for (const df of params.dependentFields) {
      sum += Number(df.value || 0) * Number(df.pricePerUnit || 0);
    }
  }

  if (params.featurePrices && Array.isArray(params.featurePrices)) {
    for (const price of params.featurePrices) {
      sum += Number(price || 0);
    }
  }

  if (params.customFeatureCount && params.customFeatureCount > 0) {
    const stdPrice = Number(params.customFeaturePrice ?? 500000);
    sum += params.customFeatureCount * stdPrice;
  }

  if (params.addOns && Array.isArray(params.addOns)) {
    for (const addOn of params.addOns) {
      if (addOn.months > 0) {
        sum += Number(addOn.pricePerMonth || 0) * addOn.months;
      }
    }
  }

  if (params.urgency === "urgent") {
    const multiplier = Number(params.urgencyMultiplier || 1.5);
    sum = Math.round(sum * multiplier);
  }

  return Math.round(sum);
}
