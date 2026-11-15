import { describe, it, expect, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
mock.module("@/lib/actions/admin-ai-relay", () => ({
  getModelPricings: async () => [],
  getFinancialMetrics: async () => ({}),
  getPendingTopupRequests: async () => [],
  runLedgerAudit: async () => [],
}));
mock.module("./client-view", () => ({
  AiRelayAdminClientView: () => <div>Operations</div>,
}));
let rows: Array<{
  id: string;
  kind: string;
  status: string;
  amount: { toString: () => string };
  lastError: null;
  invoice: { number: string; clientId: string; client: { name: string } };
}> = [];
mock.module("@/lib/prisma", () => ({
  prisma: { invoiceBalanceEffect: { findMany: async () => rows } },
}));
mock.module("@/lib/actions/invoice-reconciliation", () => ({
  retryInvoiceReconciliation: mock(),
  restoreReviewedAiAccess: mock(),
}));
const { default: Page, metadata } = await import("./page");
describe("Admin AI reconciliation entry point", () => {
  it("preserves operational content and adds the real pending review queue", async () => {
    expect(metadata.title).toContain("AI Operations");
    expect(renderToStaticMarkup(await Page())).toContain("Operations");
    rows = [
      {
        id: "effect",
        kind: "REFUND",
        status: "REVIEW",
        amount: { toString: () => "1000" },
        lastError: null,
        invoice: {
          number: "INV-TEST",
          clientId: "client",
          client: { name: "Client" },
        },
      },
    ];
    expect(renderToStaticMarkup(await Page())).toContain("INV-TEST");
  });
});
