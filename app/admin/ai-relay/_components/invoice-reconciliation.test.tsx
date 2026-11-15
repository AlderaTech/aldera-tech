import { describe, it, expect, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
mock.module("@/lib/actions/invoice-reconciliation", () => ({
  retryInvoiceReconciliation: mock(),
  restoreReviewedAiAccess: mock(),
}));
const { InvoiceReconciliation } = await import("./invoice-reconciliation");
describe("Invoice balance review panel", () => {
  it("keeps an empty queue compact and clearly describes blocked refunds", () => {
    expect(renderToStaticMarkup(<InvoiceReconciliation rows={[]} />)).toBe("");
    const html = renderToStaticMarkup(
      <InvoiceReconciliation
        rows={[
          {
            id: "effect",
            number: "INV-TEST",
            clientId: "fixture",
            clientName: "Client",
            amount: "100000",
            kind: "REFUND",
            status: "REVIEW",
            message: "Saldo refund tidak cukup.",
          },
        ]}
      />
    );
    expect(html).toContain("INV-TEST");
    expect(html).toContain("Saldo refund tidak cukup.");
    expect(html).toMatch(/disabled=""[^>]*>Buka akses AI/);
    expect(html).toContain("Coba rekonsiliasi");
  });
});
