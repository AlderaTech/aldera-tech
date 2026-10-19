import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type {
  ModelPricingItem,
  FinancialMetricsSummary,
  PendingTopupRequestItem,
} from "@/lib/ai-relay-utils";
import type { LedgerInvariantResult } from "@/lib/router-db";

mock.module("server-only", () => ({}));

let currentSearchParams = new URLSearchParams();

const redirect = mock((path: string): never => {
  throw new Error(`redirect:${path}`);
});
const notFound = mock((): never => {
  throw new Error("notFound");
});

mock.module("next/navigation", () => ({
  redirect,
  notFound,
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/ai-relay",
  useSearchParams: () => currentSearchParams,
}));

mock.module("@/lib/actions/admin-ai-relay", () => ({
  getModelPricings: mock(async () => []),
  createModelPricing: mock(),
  updateModelPricing: mock(),
  toggleModelPricingStatus: mock(),
  syncModelsFromUpstream: mock(),
  activateNewModelFromUpstream: mock(),
  getFinancialMetrics: mock(),
  getPendingTopupRequests: mock(),
  approveTopupRequest: mock(),
  rejectTopupRequest: mock(),
  runLedgerAudit: mock(),
}));

const { AiRelayAdminClientView } = await import("./client-view");

const mockPricing: ModelPricingItem[] = [
  {
    id: "p-1",
    model_name: "anthropic/claude-3-5-sonnet",
    display_name: "Claude 3.5 Sonnet",
    input_price_per_m: 50000,
    output_price_per_m: 150000,
    upstream_input_cost_per_m: 45000,
    is_active: true,
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-01-01"),
  },
  {
    id: "p-2",
    model_name: "openai/gpt-4o",
    display_name: "GPT-4o Omnichannel",
    input_price_per_m: 40000,
    output_price_per_m: 120000,
    upstream_input_cost_per_m: 35000,
    is_active: true,
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-01-01"),
  },
];

const mockMetrics: FinancialMetricsSummary = {
  totalOmzet: 10000000,
  totalTokens: 5000000,
  totalUsageCost: 6000000,
  netMargin: 4000000,
  pendingCount: 2,
  approvedCount: 15,
  rejectedCount: 1,
};

const mockPendingTopups: PendingTopupRequestItem[] = [];

const mockAuditResults: LedgerInvariantResult[] = [
  {
    check_name: "inv_balance_non_negative",
    status: "PASS",
    violation_count: 0,
    description: "Saldo user tidak boleh negatif",
  },
];

describe("AiRelayAdminClientView UI Component", () => {
  it("renders all 5 main navigation tabs", () => {
    currentSearchParams = new URLSearchParams();
    const html = renderToStaticMarkup(
      <AiRelayAdminClientView
        initialPricing={mockPricing}
        initialMetrics={mockMetrics}
        initialPendingTopups={mockPendingTopups}
        initialAuditResults={mockAuditResults}
      />
    );

    expect(html).toContain("Ringkasan Keuangan");
    expect(html).toContain("Manajemen Harga Model");
    expect(html).toContain("Sinkronisasi 9router");
    expect(html).toContain("Tiket Top-up");
    expect(html).toContain("Audit Ledger");
  });

  it("activates overview tab by default when ?tab= is not provided", () => {
    currentSearchParams = new URLSearchParams();
    const html = renderToStaticMarkup(
      <AiRelayAdminClientView
        initialPricing={mockPricing}
        initialMetrics={mockMetrics}
        initialPendingTopups={mockPendingTopups}
        initialAuditResults={mockAuditResults}
      />
    );

    expect(html).toContain("Total Omzet Top-up");
    expect(html).toContain("Volume Token Terpakai");
  });

  it("activates pricing tab when ?tab=pricing is set in query params", () => {
    currentSearchParams = new URLSearchParams("tab=pricing");
    const html = renderToStaticMarkup(
      <AiRelayAdminClientView
        initialPricing={mockPricing}
        initialMetrics={mockMetrics}
        initialPendingTopups={mockPendingTopups}
        initialAuditResults={mockAuditResults}
      />
    );

    expect(html).toContain("Katalog &amp; Dynamic Pricing Manager");
    expect(html).toContain("Claude 3.5 Sonnet");
    expect(html).toContain("GPT-4o Omnichannel");
  });

  it("filters pricing list when ?q= search param is present in the URL", () => {
    currentSearchParams = new URLSearchParams("tab=pricing&q=claude");
    const html = renderToStaticMarkup(
      <AiRelayAdminClientView
        initialPricing={mockPricing}
        initialMetrics={mockMetrics}
        initialPendingTopups={mockPendingTopups}
        initialAuditResults={mockAuditResults}
      />
    );

    expect(html).toContain("Claude 3.5 Sonnet");
    expect(html).not.toContain("GPT-4o Omnichannel");
    expect(html).toContain('value="claude"');
  });

  it("activates audit tab when ?tab=audit is set in query params", () => {
    currentSearchParams = new URLSearchParams("tab=audit");
    const html = renderToStaticMarkup(
      <AiRelayAdminClientView
        initialPricing={mockPricing}
        initialMetrics={mockMetrics}
        initialPendingTopups={mockPendingTopups}
        initialAuditResults={mockAuditResults}
      />
    );

    expect(html).toContain("inv_balance_non_negative");
  });

  it("falls back to overview tab when an invalid ?tab= parameter is provided", () => {
    currentSearchParams = new URLSearchParams("tab=invalid-tab-id");
    const html = renderToStaticMarkup(
      <AiRelayAdminClientView
        initialPricing={mockPricing}
        initialMetrics={mockMetrics}
        initialPendingTopups={mockPendingTopups}
        initialAuditResults={mockAuditResults}
      />
    );

    expect(html).toContain("Total Omzet Top-up");
  });
});
