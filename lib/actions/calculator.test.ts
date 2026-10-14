import { describe, it, expect } from "bun:test";
import { calculateOrderTotal } from "../calculator-utils";

describe("Pricing Calculator Order Total Calculations", () => {
  it("calculates base price correctly without options", () => {
    const total = calculateOrderTotal({
      basePrice: 5000000,
    });
    expect(total).toBe(5000000);
  });

  it("adds dependent field calculations (e.g. number of pages / screens)", () => {
    const total = calculateOrderTotal({
      basePrice: 3000000,
      dependentFields: [
        { value: 5, pricePerUnit: 250000 }, // 1,250,000
        { value: 2, pricePerUnit: 500000 }, // 1,000,000
      ],
    });
    // 3,000,000 + 1,250,000 + 1,000,000 = 5,250,000
    expect(total).toBe(5250000);
  });

  it("adds selected standard and major features", () => {
    const total = calculateOrderTotal({
      basePrice: 5000000,
      featurePrices: [1000000, 2500000, 750000],
    });
    // 5,000,000 + 4,250,000 = 9,250,000
    expect(total).toBe(9250000);
  });

  it("calculates custom features with standard default unit price", () => {
    const total = calculateOrderTotal({
      basePrice: 4000000,
      customFeatureCount: 3,
      customFeaturePrice: 600000,
    });
    // 4,000,000 + (3 * 600,000) = 5,800,000
    expect(total).toBe(5800000);
  });

  it("computes recurring add-ons based on selected months", () => {
    const total = calculateOrderTotal({
      basePrice: 5000000,
      addOns: [
        { pricePerMonth: 500000, months: 6 }, // 3,000,000
        { pricePerMonth: 250000, months: 12 }, // 3,000,000
        { pricePerMonth: 1000000, months: 0 }, // 0
      ],
    });
    // 5,000,000 + 3,000,000 + 3,000,000 = 11,000,000
    expect(total).toBe(11000000);
  });

  it("applies urgency multiplier when urgent timeline is selected", () => {
    const normalTotal = calculateOrderTotal({
      basePrice: 10000000,
      featurePrices: [2000000],
      urgency: "normal",
    });
    expect(normalTotal).toBe(12000000);

    const urgentTotal = calculateOrderTotal({
      basePrice: 10000000,
      featurePrices: [2000000],
      urgency: "urgent",
      urgencyMultiplier: 1.5,
    });
    // 12,000,000 * 1.5 = 18,000,000
    expect(urgentTotal).toBe(18000000);
  });

  it("handles comprehensive combined quote accurately", () => {
    const total = calculateOrderTotal({
      basePrice: 8000000,
      dependentFields: [{ value: 4, pricePerUnit: 500000 }], // +2,000,000 => 10,000,000
      featurePrices: [1500000, 2500000], // +4,000,000 => 14,000,000
      customFeatureCount: 2,
      customFeaturePrice: 500000, // +1,000,000 => 15,000,000
      addOns: [{ pricePerMonth: 500000, months: 6 }], // +3,000,000 => 18,000,000
      urgency: "urgent",
      urgencyMultiplier: 1.25, // 18,000,000 * 1.25 = 22,500,000
    });
    expect(total).toBe(22500000);
  });
});
