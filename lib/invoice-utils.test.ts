import { describe, it, expect } from "bun:test";
import {
  calculateInvoiceTotals,
  type InvoiceItemCalculation,
} from "./invoice-utils";

describe("lib/invoice-utils.ts unit test suite", () => {
  it("calculates totals with single item and zero tax", () => {
    const items: InvoiceItemCalculation[] = [{ quantity: 1, price: 1000000 }];
    const result = calculateInvoiceTotals(items, 0);

    expect(result.subtotal).toBe(1000000);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(1000000);
  });

  it("calculates multiple items with tax rate (11% PPN)", () => {
    const items: InvoiceItemCalculation[] = [
      { quantity: 2, price: 500000 }, // 1,000,000
      { quantity: 3, price: 200000 }, // 600,000
    ];
    // subtotal = 1,600,000
    // tax = 11% = 176,000
    // total = 1,776,000
    const result = calculateInvoiceTotals(items, 11);

    expect(result.subtotal).toBe(1600000);
    expect(result.taxAmount).toBe(176000);
    expect(result.total).toBe(1776000);
  });

  it("handles negative taxRate by clamping to 0", () => {
    const items: InvoiceItemCalculation[] = [{ quantity: 1, price: 500000 }];
    const result = calculateInvoiceTotals(items, -10);

    expect(result.subtotal).toBe(500000);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(500000);
  });

  it("rounds floating point subtotal and tax to 2 decimal places", () => {
    const items: InvoiceItemCalculation[] = [
      { quantity: 3, price: 33.333 }, // 99.999
    ];
    // subtotal = 100.00
    // tax 10% = 10.00
    const result = calculateInvoiceTotals(items, 10);

    expect(result.subtotal).toBe(100);
    expect(result.taxAmount).toBe(10);
    expect(result.total).toBe(110);
  });

  it("handles empty items array gracefully", () => {
    const result = calculateInvoiceTotals([], 11);
    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(0);
  });

  it("handles missing or NaN item fields safely", () => {
    const items: InvoiceItemCalculation[] = [
      // @ts-expect-error test undefined fields
      { quantity: undefined, price: 10000 },
      // @ts-expect-error test NaN fields
      { quantity: 2, price: "invalid" },
    ];
    const result = calculateInvoiceTotals(items, 0);
    expect(result.subtotal).toBe(0);
    expect(result.total).toBe(0);
  });
});
