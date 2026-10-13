export type AdminProjectType = {
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

export type AdminFeature = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isMajor: boolean;
  disclaimer: string | null;
  order: number;
  active: boolean;
  projectTypeId: string | null;
  projectType?: { name: string } | null;
};

export type AdminAddOn = {
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

export type AdminConfig = {
  id: string;
  featureDisclaimer: string;
  revisionPolicy: string;
  freeRevisions: number;
  revisionPricePerItem: number;
  urgencyMultiplier: number;
  urgencyThresholdDays: number;
  dpPercentage: number;
} | null;
