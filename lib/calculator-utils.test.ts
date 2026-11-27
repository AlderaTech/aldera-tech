import { describe, it, expect } from "bun:test";
import {
  calculateOrderTotal,
  type OrderCalculationParams,
} from "./calculator-utils";

describe("lib/calculator-utils.ts unit test suite", () => {
  it("calculates total with base price only", () => {
    const total = calculateOrderTotal({ basePrice: 5000000 });
    expect(total).toBe(5000000);
  });

  it("handles empty / default parameters safely", () => {
    // @ts-expect-error testing missing basePrice
    const total = calculateOrderTotal({});
    expect(total).toBe(0);
  });

  it("calculates dependent fields correctly", () => {
    const params: OrderCalculationParams = {
      basePrice: 3000000,
      dependentFields: [
        { value: 5, pricePerUnit: 200000 }, // 1,000,000
        { value: 2, pricePerUnit: 500000 }, // 1,000,000
      ],
    };
    expect(calculateOrderTotal(params)).toBe(5000000);
  });

  it("calculates fixed feature prices correctly", () => {
    const params: OrderCalculationParams = {
      basePrice: 2000000,
      featurePrices: [250000, 750000, 500000],
    };
    expect(calculateOrderTotal(params)).toBe(3500000);
  });

  it("calculates custom features using default price (500,000)", () => {
    const params: OrderCalculationParams = {
      basePrice: 1000000,
      customFeatureCount: 3,
    };
    expect(calculateOrderTotal(params)).toBe(2500000); // 1,000,000 + 3 * 500,000
  });

  it("calculates custom features using specified customFeaturePrice", () => {
    const params: OrderCalculationParams = {
      basePrice: 1000000,
      customFeatureCount: 2,
      customFeaturePrice: 750000,
    };
    expect(calculateOrderTotal(params)).toBe(2500000); // 1,000,000 + 2 * 750,000
  });

  it("calculates add-ons with months duration", () => {
    const params: OrderCalculationParams = {
      basePrice: 2000000,
      addOns: [
        { pricePerMonth: 100000, months: 12 }, // 1,200,000
        { pricePerMonth: 50000, months: 6 }, // 300,000
        { pricePerMonth: 200000, months: 0 }, // 0
      ],
    };
    expect(calculateOrderTotal(params)).toBe(3500000);
  });

  it("applies default urgency multiplier (1.5x) when urgency is 'urgent'", () => {
    const params: OrderCalculationParams = {
      basePrice: 1000000,
      urgency: "urgent",
    };
    expect(calculateOrderTotal(params)).toBe(1500000);
  });

  it("applies custom urgency multiplier when provided", () => {
    const params: OrderCalculationParams = {
      basePrice: 1000000,
      urgency: "urgent",
      urgencyMultiplier: 1.25,
    };
    expect(calculateOrderTotal(params)).toBe(1250000);
  });

  it("does not apply urgency multiplier when urgency is 'normal'", () => {
    const params: OrderCalculationParams = {
      basePrice: 1000000,
      urgency: "normal",
      urgencyMultiplier: 2.0,
    };
    expect(calculateOrderTotal(params)).toBe(1000000);
  });

  it("calculates full complex configuration accurately", () => {
    const params: OrderCalculationParams = {
      basePrice: 5000000,
      dependentFields: [{ value: 4, pricePerUnit: 250000 }], // 1,000,000
      featurePrices: [500000, 500000], // 1,000,000
      customFeatureCount: 2,
      customFeaturePrice: 500000, // 1,000,000
      addOns: [{ pricePerMonth: 100000, months: 10 }], // 1,000,000
      // Sum before urgency: 5M + 1M + 1M + 1M + 1M = 9,000,000
      urgency: "urgent", // * 1.5 = 13,500,000
    };
    expect(calculateOrderTotal(params)).toBe(13500000);
  });
});
