import { mock } from "bun:test";
import type { ComponentType, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Tabs } from "@/components/ui/tabs";
import type {
  ModelPricingItem,
  PendingTopupRequestItem,
} from "@/lib/ai-relay-utils";
mock.module("server-only", () => ({}));
mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/ai-relay",
  useSearchParams: () => new URLSearchParams(),
}));
export const mutations = {
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
};
mock.module("@/lib/actions/admin-ai-relay", () => mutations);
// Portal layout is covered by the real Radix dialog tests. Render its content here to test forms without a browser document.
mock.module("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open?: boolean; children: ReactNode }) =>
    open ? <section role="dialog">{children}</section> : null,
  DialogContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: ReactNode }) => (
    <header>{children}</header>
  ),
  DialogFooter: ({ children }: { children: ReactNode }) => (
    <footer>{children}</footer>
  ),
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: ReactNode }) => (
    <p>{children}</p>
  ),
}));
const { useAdminAiRelay } = await import("../_hooks/use-admin-ai-relay");
import type {
  AdminAiRelayState,
  AdminClientViewProps,
} from "../_hooks/use-admin-ai-relay";
export const model: ModelPricingItem = {
  id: 901,
  model_name: "fixture/provider-model",
  display_name: "Model fixture",
  input_price_per_m: 21000,
  output_price_per_m: 42000,
  upstream_input_cost_per_m: 14000,
  is_active: true,
  created_at: new Date("2026-01-01Z"),
  updated_at: new Date("2026-01-01Z"),
};
export const ticket: PendingTopupRequestItem = {
  id: 902,
  user_id: 123,
  amount: 50000,
  unique_code: 123,
  total_transfer: 50123,
  proof_file_id: "fixture-proof",
  status: "pending",
  created_at: new Date("2026-01-01Z"),
  user_name: "Fixture pengguna",
  user_username: null,
  telegram_id: null,
  web_user_id: null,
};
export function renderRelay(
  Component: ComponentType<{ state: AdminAiRelayState }>,
  tab = "overview",
  overrides: Partial<AdminAiRelayState> = {},
  props: Partial<AdminClientViewProps> = {}
) {
  function Harness() {
    const state = useAdminAiRelay({
      initialPricing: [],
      initialMetrics: {
        totalOmzet: 0,
        totalTokens: 0,
        totalUsageCost: 0,
        netMargin: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
      },
      initialPendingTopups: [],
      initialAuditResults: [],
      ...props,
    });
    return (
      <Tabs value={tab}>
        <Component state={{ ...state, ...overrides }} />
      </Tabs>
    );
  }
  return renderToStaticMarkup(<Harness />);
}
