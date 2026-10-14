import { describe, it, expect } from "bun:test";
import { calculateInvoiceTotals } from "../invoice-utils";

describe("Invoice Line Item, Subtotal, Tax and Total Computations", () => {
  it("calculates subtotal and total for single item with 0% tax", () => {
    const result = calculateInvoiceTotals(
      [{ quantity: 1, price: 15000000 }],
      0
    );

    expect(result.subtotal).toBe(15000000);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(15000000);
  });

  it("calculates multiple items with quantity multiplications", () => {
    const items = [
      { quantity: 2, price: 3500000 }, // 7,000,000
      { quantity: 5, price: 1000000 }, // 5,000,000
      { quantity: 1, price: 2500000 }, // 2,500,000
    ];

    const result = calculateInvoiceTotals(items, 0);
    // 7,000,000 + 5,000,000 + 2,500,000 = 14,500,000
    expect(result.subtotal).toBe(14500000);
    expect(result.total).toBe(14500000);
  });

  it("calculates Indonesian VAT / PPN 11% accurately", () => {
    const items = [
      { quantity: 1, price: 10000000 }, // 10,000,000
    ];

    const result = calculateInvoiceTotals(items, 11);
    expect(result.subtotal).toBe(10000000);
    expect(result.taxAmount).toBe(1100000); // 10,000,000 * 0.11 = 1,100,000
    expect(result.total).toBe(11100000);
  });

  it("handles decimal prices and fractional tax amounts with correct rounding", () => {
    const items = [
      { quantity: 3, price: 333333.33 }, // 999,999.99
    ];

    const result = calculateInvoiceTotals(items, 11);
    expect(result.subtotal).toBe(999999.99);
    expect(result.taxAmount).toBe(110000);
    expect(result.total).toBe(1109999.99);
  });

  it("returns zero for empty invoice items list", () => {
    const result = calculateInvoiceTotals([], 11);
    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(0);
  });
});
