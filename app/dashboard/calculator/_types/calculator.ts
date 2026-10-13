export type DependentField = {
  label: string;
  type: string;
  pricePerUnit: number;
  unit: string;
  min?: number;
  max?: number;
};

export type ProjectType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  icon: string;
  dependentFields: unknown;
  order: number;
};

export type Feature = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isMajor: boolean;
  disclaimer: string | null;
  projectTypeId: string | null;
};

export type AddOn = {
  id: string;
  name: string;
  description: string | null;
  pricePerMonth: number;
  minMonths: number;
  maxMonths: number;
  projectTypeId: string | null;
};

export type Config = {
  featureDisclaimer: string;
  revisionPolicy: string;
  freeRevisions: number;
  revisionPricePerItem: number;
  urgencyMultiplier: number;
  urgencyThresholdDays: number;
  dpPercentage: number;
} | null;

export type CalculatorData = {
  projectTypes: ProjectType[];
  features: Feature[];
  addOns: AddOn[];
  config: Config;
};
