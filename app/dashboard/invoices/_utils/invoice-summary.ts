import type { ClientInvoiceItem } from "../_types/invoice";

export function summarizeInvoices(invoices: readonly ClientInvoiceItem[]) {
  const summary = {
    awaiting: { amount: 0, count: 0 },
    verification: { amount: 0, count: 0 },
    paid: { amount: 0, count: 0 },
  };

  for (const invoice of invoices) {
    const group =
      invoice.status === "SENT" || invoice.status === "OVERDUE"
        ? summary.awaiting
        : invoice.status === "PENDING_VERIFICATION"
          ? summary.verification
          : invoice.status === "PAID"
            ? summary.paid
            : null;
    if (group) {
      group.amount += invoice.total;
      group.count += 1;
    }
  }

  return summary;
}
