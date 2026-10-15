import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";

/**
 * Shared Calculation Engine & Types for Aldera Tech.
 * Provides unified, deterministic math and cached catalog retrieval
 * for public pricing, client dashboard, and administrative tooling.
 */

export type CalculationItemType =
  | "base"
  | "dependent_field"
  | "feature"
  | "custom_feature"
  | "addon"
  | "urgency"
  | "discount";

export type CalculationItem = {
  label: string;
  amount: number;
  type: CalculationItemType;
  category: CalculationItemType;
  details?: string;
};

export type OrderCalculationParams = {
  basePrice?: number;
  projectTypeId?: string;
  dependentFields?: Array<{ value: number; pricePerUnit: number; label?: string }>;
  featurePrices?: number[];
  selectedFeatureIds?: string[];
  features?: Array<{ id?: string; name?: string; price: number }>;
  customFeatureCount?: number;
  customFeaturePrice?: number;
  customFeatures?: Array<{ name: string; description?: string; price?: number }>;
  addOns?: Array<{ id?: string; name?: string; pricePerMonth: number; months: number }>;
  selectedAddOnIds?: string[] | Record<string, number>;
  urgency?: "normal" | "urgent" | string;
  urgencyMultiplier?: number;
  discountPercentage?: number;
  discountAmount?: number;
};

export type CalculationBreakdown = {
  basePrice: number;
  dependentFieldsTotal: number;
  featuresTotal: number;
  customFeaturesTotal: number;
  addOnsTotal: number;
  subtotal: number;
  urgency: "normal" | "urgent";
  urgencyMultiplier: number;
  urgencyFee: number;
  discountPercentage: number;
  discountFromPercentage: number;
  discountAmount: number;
  discountTotal: number;
  finalTotal: number;
  itemizedList: CalculationItem[];
};

export type CalculatorProjectType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  icon: string;
  dependentFields: unknown;
  order: number;
  active: boolean;
};

export type CalculatorFeatureOption = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isMajor: boolean;
  disclaimer: string | null;
  order: number;
  active: boolean;
  projectTypeId: string | null;
};

export type CalculatorAddOnOption = {
  id: string;
  name: string;
  description: string | null;
  pricePerMonth: number;
  minMonths: number;
  maxMonths: number;
  order: number;
  active: boolean;
  projectTypeId: string | null;
};

export type CalculatorConfigData = {
  id: string;
  featureDisclaimer: string;
  revisionPolicy: string;
  freeRevisions: number;
  revisionPricePerItem: number;
  urgencyMultiplier: number;
  urgencyThresholdDays: number;
  dpPercentage: number;
};

export type CalculatorData = {
  projectTypes: CalculatorProjectType[];
  featureOptions: CalculatorFeatureOption[];
  features: CalculatorFeatureOption[];
  addOnOptions: CalculatorAddOnOption[];
  addOns: CalculatorAddOnOption[];
  calculatorConfig: CalculatorConfigData | null;
  config: CalculatorConfigData | null;
};

/**
 * Pure breakdown calculator generating transparent, itemized quote calculation.
 */
export function calculateOrderBreakdown(
  params: OrderCalculationParams
): CalculationBreakdown {
  const basePrice = Math.max(0, Number(params.basePrice || 0));

  // 1. Dependent fields calculation
  let dependentFieldsTotal = 0;
  const dependentItems: CalculationItem[] = [];
  if (params.dependentFields && Array.isArray(params.dependentFields)) {
    for (const df of params.dependentFields) {
      const val = Math.max(0, Number(df.value || 0));
      const unitPrice = Math.max(0, Number(df.pricePerUnit || 0));
      const amount = val * unitPrice;
      if (amount > 0) {
        dependentFieldsTotal += amount;
        dependentItems.push({
          label: df.label ? `${df.label} (${val} unit)` : `Biaya Skala Proyek (${val} unit)`,
          amount,
          type: "dependent_field",
          category: "dependent_field",
          details: `${val} x Rp ${unitPrice.toLocaleString("id-ID")}`,
        });
      }
    }
  }

  // 2. Features calculation
  let featuresTotal = 0;
  const featureItems: CalculationItem[] = [];
  if (params.features && Array.isArray(params.features)) {
    for (const feat of params.features) {
      const price = Math.max(0, Number(feat.price || 0));
      featuresTotal += price;
      if (price > 0) {
        featureItems.push({
          label: feat.name || "Fitur Tambahan",
          amount: price,
          type: "feature",
          category: "feature",
        });
      }
    }
  } else if (params.featurePrices && Array.isArray(params.featurePrices)) {
    for (const price of params.featurePrices) {
      const p = Math.max(0, Number(price || 0));
      featuresTotal += p;
      if (p > 0) {
        featureItems.push({
          label: "Fitur Tambahan",
          amount: p,
          type: "feature",
          category: "feature",
        });
      }
    }
  }

  // 3. Custom features calculation
  let customFeaturesTotal = 0;
  const customItems: CalculationItem[] = [];
  let customCount = 0;
  const customUnitPrice = Math.max(0, Number(params.customFeaturePrice ?? 500000));

  if (params.customFeatures && Array.isArray(params.customFeatures)) {
    customCount = params.customFeatures.length;
    for (const cf of params.customFeatures) {
      const itemPrice = cf.price ? Math.max(0, Number(cf.price)) : customUnitPrice;
      customFeaturesTotal += itemPrice;
      customItems.push({
        label: `Kustom: ${cf.name}`,
        amount: itemPrice,
        type: "custom_feature",
        category: "custom_feature",
        details: cf.description,
      });
    }
  } else if (params.customFeatureCount && params.customFeatureCount > 0) {
    customCount = Math.max(0, Number(params.customFeatureCount));
    customFeaturesTotal = customCount * customUnitPrice;
    if (customFeaturesTotal > 0) {
      customItems.push({
        label: `Fitur Kustom (${customCount} fitur)`,
        amount: customFeaturesTotal,
        type: "custom_feature",
        category: "custom_feature",
        details: `${customCount} x Rp ${customUnitPrice.toLocaleString("id-ID")}`,
      });
    }
  }

  // 4. Add-on services calculation
  let addOnsTotal = 0;
  const addOnItems: CalculationItem[] = [];
  if (params.addOns && Array.isArray(params.addOns)) {
    for (const addOn of params.addOns) {
      const months = Math.max(0, Number(addOn.months || 0));
      const monthlyPrice = Math.max(0, Number(addOn.pricePerMonth || 0));
      if (months > 0 && monthlyPrice > 0) {
        const cost = monthlyPrice * months;
        addOnsTotal += cost;
        addOnItems.push({
          label: addOn.name ? `${addOn.name} (${months} bulan)` : `Add-on (${months} bulan)`,
          amount: cost,
          type: "addon",
          category: "addon",
          details: `${months} bulan @ Rp ${monthlyPrice.toLocaleString("id-ID")}/bln`,
        });
      }
    }
  }

  // Subtotal (gross baseline before rush multipliers and discounts)
  const subtotal =
    basePrice +
    dependentFieldsTotal +
    featuresTotal +
    customFeaturesTotal +
    addOnsTotal;

  // 5. Urgency multiplier and fee calculation
  const isUrgent = params.urgency === "urgent";
  const rawUrgencyMultiplier = Number(params.urgencyMultiplier || 1.5);
  const urgencyMultiplier = isUrgent
    ? Math.max(1.0, isNaN(rawUrgencyMultiplier) ? 1.5 : rawUrgencyMultiplier)
    : 1.0;
  const urgencyFee = isUrgent
    ? Math.round(subtotal * (urgencyMultiplier - 1.0))
    : 0;

  // Gross total before discount
  const grossTotal = subtotal + urgencyFee;

  // 6. Promotional discounts (percentage + fixed amount)
  let rawPct = Number(params.discountPercentage || 0);
  if (isNaN(rawPct) || rawPct < 0) {
    rawPct = 0;
  } else if (rawPct > 100) {
    rawPct = 100;
  } else if (rawPct > 0 && rawPct < 1) {
    // Treat fractional input (e.g. 0.15) as 15%
    rawPct = rawPct * 100;
  }
  const discountPercentage = rawPct;
  const discountFromPercentage = Math.round(grossTotal * (discountPercentage / 100));

  const rawFixedDiscount = Math.max(0, Number(params.discountAmount || 0));
  const discountAmount = isNaN(rawFixedDiscount) ? 0 : rawFixedDiscount;

  // Total discount cannot exceed gross total (never negative total)
  const discountTotal = Math.min(grossTotal, discountFromPercentage + discountAmount);
  const finalTotal = Math.max(0, grossTotal - discountTotal);

  // 7. Assemble comprehensive itemized list
  const itemizedList: CalculationItem[] = [
    {
      label: "Base Project Price",
      amount: basePrice,
      type: "base",
      category: "base",
    },
    ...dependentItems,
    ...featureItems,
    ...customItems,
    ...addOnItems,
  ];

  if (urgencyFee > 0) {
    itemizedList.push({
      label: `Rush Urgency Fee (${urgencyMultiplier}x)`,
      amount: urgencyFee,
      type: "urgency",
      category: "urgency",
      details: `Multiplier ${urgencyMultiplier}x applied to subtotal`,
    });
  }

  if (discountTotal > 0) {
    itemizedList.push({
      label: "Promotional Discount",
      amount: -discountTotal,
      type: "discount",
      category: "discount",
      details: discountPercentage > 0 && discountAmount > 0
        ? `Diskon ${discountPercentage}% + potongan Rp ${discountAmount.toLocaleString("id-ID")}`
        : discountPercentage > 0
          ? `Diskon ${discountPercentage}%`
          : `Potongan langsung Rp ${discountAmount.toLocaleString("id-ID")}`,
    });
  }

  return {
    basePrice,
    dependentFieldsTotal,
    featuresTotal,
    customFeaturesTotal,
    addOnsTotal,
    subtotal,
    urgency: isUrgent ? "urgent" : "normal",
    urgencyMultiplier,
    urgencyFee,
    discountPercentage,
    discountFromPercentage,
    discountAmount,
    discountTotal,
    finalTotal,
    itemizedList,
  };
}

/**
 * Pure calculation utility returning a single numeric final total.
 */
export function calculateOrderTotal(params: OrderCalculationParams): number {
  return calculateOrderBreakdown(params).finalTotal;
}

/**
 * Cached database query retrieving current active project types, feature options,
 * add-on options, and calculator configuration.
 */
export const getCalculatorData = cache(async (): Promise<CalculatorData> => {
  return safeDb(
    async () => {
      const [projectTypes, featureOptions, addOnOptions, calculatorConfig] =
        await Promise.all([
          prisma.projectType.findMany({
            where: { active: true },
            orderBy: { order: "asc" },
          }),
          prisma.featureOption.findMany({
            where: { active: true },
            orderBy: { order: "asc" },
          }),
          prisma.addOnOption.findMany({
            where: { active: true },
            orderBy: { order: "asc" },
          }),
          prisma.calculatorConfig.findUnique({
            where: { id: "calculator" },
          }),
        ]);

      const formattedProjectTypes: CalculatorProjectType[] = projectTypes.map((pt) => ({
        id: pt.id,
        name: pt.name,
        slug: pt.slug,
        description: pt.description,
        basePrice: Number(pt.basePrice),
        icon: pt.icon,
        dependentFields: pt.dependentFields,
        order: pt.order,
        active: pt.active,
      }));

      const formattedFeatures: CalculatorFeatureOption[] = featureOptions.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        price: Number(f.price),
        isMajor: f.isMajor,
        disclaimer: f.disclaimer,
        order: f.order,
        active: f.active,
        projectTypeId: f.projectTypeId,
      }));

      const formattedAddOns: CalculatorAddOnOption[] = addOnOptions.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        pricePerMonth: Number(a.pricePerMonth),
        minMonths: a.minMonths,
        maxMonths: a.maxMonths,
        order: a.order,
        active: a.active,
        projectTypeId: a.projectTypeId,
      }));

      const formattedConfig: CalculatorConfigData | null = calculatorConfig
        ? {
            id: calculatorConfig.id,
            featureDisclaimer: calculatorConfig.featureDisclaimer,
            revisionPolicy: calculatorConfig.revisionPolicy,
            freeRevisions: calculatorConfig.freeRevisions,
            revisionPricePerItem: Number(calculatorConfig.revisionPricePerItem),
            urgencyMultiplier: Number(calculatorConfig.urgencyMultiplier),
            urgencyThresholdDays: calculatorConfig.urgencyThresholdDays,
            dpPercentage: calculatorConfig.dpPercentage,
          }
        : null;

      return {
        projectTypes: formattedProjectTypes,
        featureOptions: formattedFeatures,
        addOnOptions: formattedAddOns,
        calculatorConfig: formattedConfig,
        // Dual-property aliases for seamless compatibility with CalculatorWizard
        features: formattedFeatures,
        addOns: formattedAddOns,
        config: formattedConfig,
      };
    },
    {
      projectTypes: [],
      featureOptions: [],
      addOnOptions: [],
      calculatorConfig: null,
      features: [],
      addOns: [],
      config: null,
    }
  );
});
