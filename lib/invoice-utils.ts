/**
 * Pure calculation utilities for invoices, line items, and taxes.
 */

export type InvoiceItemCalculation = {
  quantity: number;
  price: number;
};

export function calculateInvoiceTotals(
  items: InvoiceItemCalculation[],
  taxRate: number
): {
  subtotal: number;
  taxAmount: number;
  total: number;
} {
  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.quantity || 0) * Number(it.price || 0),
    0
  );
  const tax = Math.max(0, Number(taxRate || 0));
  const taxAmount = (subtotal * tax) / 100;
  const total = subtotal + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
