import type { MidtransItemDetail } from "@/lib/midtrans";

export function invoiceSnapItems(invoice: {
  total: { toString(): string };
  taxAmount: { toString(): string };
  taxRate: { toString(): string };
  items: { id: string; description: string; total: { toString(): string } }[];
}): MidtransItemDetail[] {
  const items = invoice.items.map((item) => ({
    id: item.id,
    name: item.description.slice(0, 50),
    price: Math.round(Number(item.total)),
    quantity: 1,
  }));
  if (Number(invoice.taxAmount) > 0)
    items.push({
      id: "TAX",
      name: `Pajak (${invoice.taxRate}%)`,
      price: Math.round(Number(invoice.taxAmount)),
      quantity: 1,
    });
  const total = Math.round(Number(invoice.total));
  if (!items.length)
    items.push({
      id: "INVOICE",
      name: "Pembayaran tagihan",
      price: total,
      quantity: 1,
    });
  items[items.length - 1].price +=
    total - items.reduce((sum, item) => sum + item.price, 0);
  return items;
}
