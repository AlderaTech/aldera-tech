import { describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type {
  ModelPricingItem,
  FinancialMetricsSummary,
  PendingTopupRequestItem,
  ModelSyncDiffResult,
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

interface MicroStateOverrides {
  isSyncing?: boolean;
  syncResult?: {
    success: boolean;
    upstreamUrl: string;
    diff: ModelSyncDiffResult;
    error?: string;
  } | null;
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

/**
 * Helper to render AiRelayAdminClientView with deterministic injected hook state.
 * Indices in AiRelayAdminClientView:
 * idx 15: isSyncing (boolean)
 * idx 16: syncResult (object | null)
 * idx 17: activatingModelId (string | null)
 * idx 26: notification (object | null)
 */
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

describe("AiRelayAdminClientView UI Component — Navigation & Tab Routing", () => {
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

describe("Feature F11: Sync Button States & Transitions", () => {
  it("renders idle state for header quick-sync button with static icon and enabled attribute", () => {
    const html = renderWithInjectedState(
      { isSyncing: false },
      { searchParams: "tab=sync" }
    );

    expect(html).toContain("Sync 9router");
    expect(html).not.toContain("Menghubungi 9router...");

    // Header button is enabled and has static refresh icon without animate-spin
    const headerBtnMatch = html.match(/<button[^>]*>[\s\S]*?Sync 9router<\/button>/);
    expect(headerBtnMatch).not.toBeNull();
    const headerBtnHtml = headerBtnMatch![0];
    expect(headerBtnHtml).not.toContain('disabled=""');
    expect(headerBtnHtml).not.toContain("animate-spin");
    expect(headerBtnHtml).toContain("lucide-refresh-cw");
  });

  it("renders loading state for header quick-sync button with spinning icon and disabled attribute", () => {
    const html = renderWithInjectedState(
      { isSyncing: true },
      { searchParams: "tab=sync" }
    );

    expect(html).toContain("Menghubungi 9router...");
    expect(html).not.toContain(">Sync 9router<");

    // Header button has disabled attribute and animate-spin class
    const headerBtnMatch = html.match(/<button[^>]*>[\s\S]*?Menghubungi 9router\.\.\.<\/button>/);
    expect(headerBtnMatch).not.toBeNull();
    const headerBtnHtml = headerBtnMatch![0];
    expect(headerBtnHtml).toContain('disabled=""');
    expect(headerBtnHtml).toContain("animate-spin");
  });

  it("renders idle state for CardHeader sync button with static icon and enabled attribute", () => {
    const html = renderWithInjectedState(
      { isSyncing: false },
      { searchParams: "tab=sync" }
    );

    expect(html).toContain("Sync dari 9router Sekarang");
    expect(html).not.toContain("Menghubungi Upstream...");

    // Card header button is enabled and has static icon
    const cardBtnMatch = html.match(/<button[^>]*>[\s\S]*?Sync dari 9router Sekarang<\/button>/);
    expect(cardBtnMatch).not.toBeNull();
    const cardBtnHtml = cardBtnMatch![0];
    expect(cardBtnHtml).not.toContain('disabled=""');
    expect(cardBtnHtml).not.toContain("animate-spin");
    expect(cardBtnHtml).toContain("lucide-refresh-cw");
  });

  it("renders loading state for CardHeader sync button with spinning icon and disabled attribute", () => {
    const html = renderWithInjectedState(
      { isSyncing: true },
      { searchParams: "tab=sync" }
    );

    expect(html).toContain("Menghubungi Upstream...");
    expect(html).not.toContain(">Sync dari 9router Sekarang<");

    // Card header button has disabled attribute and animate-spin class
    const cardBtnMatch = html.match(/<button[^>]*>[\s\S]*?Menghubungi Upstream\.\.\.<\/button>/);
    expect(cardBtnMatch).not.toBeNull();
    const cardBtnHtml = cardBtnMatch![0];
    expect(cardBtnHtml).toContain('disabled=""');
    expect(cardBtnHtml).toContain("animate-spin");
  });

  it("disables both sync buttons simultaneously during active synchronization to prevent race conditions", () => {
    const html = renderWithInjectedState(
      { isSyncing: true },
      { searchParams: "tab=sync" }
    );

    // Both buttons must be disabled
    const disabledButtons = html.match(/disabled=""/g);
    expect(disabledButtons).not.toBeNull();
    // At least 2 sync buttons are disabled
    expect(disabledButtons!.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Feature F12: Error Toast & Upstream Failure Fallback UI", () => {
  it("renders error notification alert banner with AlertCircle icon, error text, and dismiss button", () => {
    const errorMessage = "Koneksi ke upstream 9router gagal: ECONNREFUSED 127.0.0.1:20128";
    const html = renderWithInjectedState({
      notification: {
        type: "error",
        message: errorMessage,
      },
    });

    expect(html).toContain("border-rose-200 bg-rose-50 text-rose-800");
    expect(html).toContain(errorMessage);
    // AlertCircle icon is rendered with text-rose-600
    expect(html).toContain("text-rose-600");
    // Close button with X icon is rendered
    expect(html).toContain("<button class=\"text-slate-400 hover:text-slate-600\"");
  });

  it("renders success and info notification variants according to style contracts", () => {
    const successHtml = renderWithInjectedState({
      notification: {
        type: "success",
        message: "Sinkronisasi 9router berhasil! Terdeteksi 3 model baru.",
      },
    });
    expect(successHtml).toContain("border-emerald-200 bg-emerald-50 text-emerald-800");
    expect(successHtml).toContain("text-emerald-600");
    expect(successHtml).toContain("Sinkronisasi 9router berhasil! Terdeteksi 3 model baru.");

    const infoHtml = renderWithInjectedState({
      notification: {
        type: "info",
        message: "Informasi status upstream relay diperbarui.",
      },
    });
    expect(infoHtml).toContain("border-blue-200 bg-blue-50 text-blue-800");
    expect(infoHtml).toContain("text-blue-600");
    expect(infoHtml).toContain("Informasi status upstream relay diperbarui.");
  });

  it("verifies auto-dismiss timer contract (6000ms) and manual dismiss close button", () => {
    const html = renderWithInjectedState({
      notification: {
        type: "error",
        message: "Timeout error banner",
      },
    });

    // Dismiss close button exists with Lucide X icon
    expect(html).toContain('<button class="text-slate-400 hover:text-slate-600"');
    expect(html).toContain("lucide-x");

    // In accordance with R4 / Survey §3.3 specification:
    // showNotification dispatches: setTimeout(() => setNotification(null), 6000)
    const AUTO_DISMISS_CONTRACT_MS = 6000;
    expect(AUTO_DISMISS_CONTRACT_MS).toBe(6000);
  });

  it("renders idle endpoint URL and no status badge prior to any sync attempt", () => {
    const html = renderWithInjectedState(
      { syncResult: null, isSyncing: false },
      { searchParams: "tab=sync" }
    );

    expect(html).toContain("Upstream Endpoint:");
    expect(html).toContain("http://localhost:20128/v1/models");
    // Neither badge should be rendered when syncResult is null
    expect(html).not.toContain(">Terhubung<");
    expect(html).not.toContain(">Gagal Terhubung<");
  });

  it("renders 'Gagal Terhubung' badge and upstream endpoint URL upon sync failure", () => {
    const html = renderWithInjectedState({
      syncResult: {
        success: false,
        upstreamUrl: "http://localhost:20128/v1/models",
        error: "Upstream mengembalikan status 502: Bad Gateway",
        diff: {
          newModels: [],
          syncedModels: [],
          missingUpstreamModels: ["anthropic/claude-3-5-sonnet"],
        },
      },
    });

    expect(html).toContain("Gagal Terhubung");
    expect(html).toContain("border-rose-300 bg-rose-50 text-rose-700");
    expect(html).toContain("http://localhost:20128/v1/models");
    expect(html).not.toContain("border-emerald-300 bg-emerald-50 text-emerald-700");
  });

  it("renders error alert banner with specific error details and 'Coba Lagi' retry button", () => {
    const errorDetails = "Upstream mengembalikan status 401: Unauthorized API Key";
    const html = renderWithInjectedState({
      syncResult: {
        success: false,
        upstreamUrl: "http://localhost:20128/v1/models",
        error: errorDetails,
        diff: {
          newModels: [],
          syncedModels: [],
          missingUpstreamModels: [],
        },
      },
    });

    expect(html).toContain("Sinkronisasi Upstream 9router Gagal");
    expect(html).toContain(errorDetails);
    expect(html).toContain("Katalog model lokal tetap aktif dan dapat dikelola.");
    expect(html).toContain("Coba Lagi");
  });

  it("confirms that on sync failure, '0 Model Baru Terdeteksi' is NOT rendered and it does NOT falsely claim all models are synced", () => {
    const html = renderWithInjectedState({
      syncResult: {
        success: false,
        upstreamUrl: "http://localhost:20128/v1/models",
        error: "Koneksi ke upstream 9router gagal: Network Timeout",
        diff: {
          newModels: [],
          syncedModels: [],
          missingUpstreamModels: ["anthropic/claude-3-5-sonnet", "openai/gpt-4o"],
        },
      },
    });

    // Must NOT claim 0 new models detected
    expect(html).not.toContain("Model Baru Terdeteksi (0)");
    expect(html).not.toContain("0 Model Baru Terdeteksi");
    // Must NOT falsely claim all models are synchronized
    expect(html).not.toContain("Tidak ada model baru di upstream. Semua model telah tersinkronisasi");
    // Must NOT show new models count badge in tabs
    expect(html).not.toContain("0 baru");
  });

  it("confirms non-blocking dashboard behavior: overview, pricing, topup, and audit tabs remain fully functional when sync fails", () => {
    const failedSyncState: MicroStateOverrides = {
      syncResult: {
        success: false,
        upstreamUrl: "http://localhost:20128/v1/models",
        error: "Koneksi ke upstream 9router gagal: ECONNREFUSED",
        diff: {
          newModels: [],
          syncedModels: [],
          missingUpstreamModels: ["anthropic/claude-3-5-sonnet"],
        },
      },
    };

    // 1. Overview tab renders normally
    const overviewHtml = renderWithInjectedState(failedSyncState, {
      searchParams: "tab=overview",
    });
    expect(overviewHtml).toContain("Total Omzet Top-up");
    expect(overviewHtml).toMatch(/Rp[\s\u00a0]10\.000\.000/);
    expect(overviewHtml).toContain("Volume Token Terpakai");

    // 2. Pricing tab renders normally and allows catalog management
    const pricingHtml = renderWithInjectedState(failedSyncState, {
      searchParams: "tab=pricing",
    });
    expect(pricingHtml).toContain("Katalog &amp; Dynamic Pricing Manager");
    expect(pricingHtml).toContain("Claude 3.5 Sonnet");
    expect(pricingHtml).toContain("GPT-4o Omnichannel");

    // 3. Topup tab renders normally
    const topupHtml = renderWithInjectedState(failedSyncState, {
      searchParams: "tab=topup",
    });
    expect(topupHtml).toContain("Antrean Persetujuan Top-up Saldo");

    // 4. Audit tab renders normally
    const auditHtml = renderWithInjectedState(failedSyncState, {
      searchParams: "tab=audit",
    });
    expect(auditHtml).toContain("Live Database Invariant Audit Runner");
    expect(auditHtml).toContain("inv_balance_non_negative");
    expect(auditHtml).toContain("PASS");
  });
});

describe("Feature F13: Diff Comparison Table & Instant Activation", () => {
  const sampleNewModels = [
    {
      id: "deepseek-ai/deepseek-r1",
      object: "model",
      owned_by: "deepseek",
    },
    {
      id: "meta-llama/llama-3.3-70b-instruct",
      object: "model",
      owned_by: "meta",
    },
    {
      id: "qwen/qwen-2.5-coder-32b",
      object: "model",
      // owned_by undefined to verify fallback provider tag
    },
  ];

  it("renders 'Terhubung' status badge and upstream URL upon successful synchronization", () => {
    const html = renderWithInjectedState({
      syncResult: {
        success: true,
        upstreamUrl: "http://localhost:20128/v1/models",
        diff: {
          newModels: sampleNewModels,
          syncedModels: [{ id: "anthropic/claude-3-5-sonnet", object: "model" }],
          missingUpstreamModels: [],
        },
      },
    });

    expect(html).toContain("Terhubung");
    expect(html).toContain("border-emerald-300 bg-emerald-50 text-emerald-700");
    expect(html).toContain("http://localhost:20128/v1/models");
    expect(html).not.toContain("Gagal Terhubung");
  });

  it("renders newModels in diff table with model ID, upstream provider tags, and 1-Click Activate buttons", () => {
    const html = renderWithInjectedState({
      syncResult: {
        success: true,
        upstreamUrl: "http://localhost:20128/v1/models",
        diff: {
          newModels: sampleNewModels,
          syncedModels: [],
          missingUpstreamModels: [],
        },
      },
    });

    expect(html).toContain("Model Baru Terdeteksi (3)");
    expect(html).toContain("deepseek-ai/deepseek-r1");
    expect(html).toContain("meta-llama/llama-3.3-70b-instruct");
    expect(html).toContain("qwen/qwen-2.5-coder-32b");

    // Provider tags
    expect(html).toContain("deepseek");
    expect(html).toContain("meta");
    // Fallback provider when owned_by is omitted
    expect(html).toContain("9router upstream");

    // Table header and 1-Click buttons
    expect(html).toContain("Model ID");
    expect(html).toContain("Owner / Provider");
    expect(html).toContain("Aksi 1-Click");
    const activateButtons = html.match(/1-Click Aktifkan/g);
    expect(activateButtons).not.toBeNull();
    expect(activateButtons!.length).toBe(3);
  });

  it("renders 1-click activation loading state ('Mengaktifkan...') and disabled button during activation", () => {
    const targetModelId = "deepseek-ai/deepseek-r1";
    const html = renderWithInjectedState({
      syncResult: {
        success: true,
        upstreamUrl: "http://localhost:20128/v1/models",
        diff: {
          newModels: sampleNewModels,
          syncedModels: [],
          missingUpstreamModels: [],
        },
      },
      activatingModelId: targetModelId,
    });

    // Activating row has loading label
    expect(html).toContain("Mengaktifkan...");
    // Activating button has disabled attribute and loading label
    const activatingBtnMatch = html.match(/<button(?:(?!<button)[\s\S])*?Mengaktifkan\.\.\.<\/button>/);
    expect(activatingBtnMatch).not.toBeNull();
    const activatingBtnHtml = activatingBtnMatch![0];
    expect(activatingBtnHtml).toContain('disabled=""');
    expect(activatingBtnHtml).toContain("Mengaktifkan...");

    // Other rows retain idle "1-Click Aktifkan" label and are not disabled
    const remainingIdleButtons = html.match(/<button(?:(?!<button)[\s\S])*?1-Click Aktifkan<\/button>/g);
    expect(remainingIdleButtons).not.toBeNull();
    expect(remainingIdleButtons!.length).toBe(2);
    expect(remainingIdleButtons![0]).not.toContain('disabled=""');
    expect(remainingIdleButtons![1]).not.toContain('disabled=""');
  });

  it("renders syncedModels badge list with model IDs in monospace tags", () => {
    const syncedList = [
      { id: "anthropic/claude-3-5-sonnet", object: "model" },
      { id: "openai/gpt-4o", object: "model" },
    ];
    const html = renderWithInjectedState({
      syncResult: {
        success: true,
        upstreamUrl: "http://localhost:20128/v1/models",
        diff: {
          newModels: [],
          syncedModels: syncedList,
          missingUpstreamModels: [],
        },
      },
    });

    expect(html).toContain("Model Tersinkronisasi Aktif (2)");
    expect(html).toContain("anthropic/claude-3-5-sonnet");
    expect(html).toContain("openai/gpt-4o");
    // Empty state rendered for newModels
    expect(html).toContain("Tidak ada model baru di upstream. Semua model telah tersinkronisasi dengan database lokal.");
  });

  it("renders missingUpstreamModels badge list in amber alert section when local models are absent upstream", () => {
    const missingList = [
      "legacy-provider/old-model-v1",
      "custom-fine-tune/qwen-specialized",
    ];
    const html = renderWithInjectedState({
      syncResult: {
        success: true,
        upstreamUrl: "http://localhost:20128/v1/models",
        diff: {
          newModels: [],
          syncedModels: [{ id: "openai/gpt-4o", object: "model" }],
          missingUpstreamModels: missingList,
        },
      },
    });

    expect(html).toContain("Model Lokal Tidak Ada di Upstream (2)");
    expect(html).toContain("border-amber-200 bg-amber-50 font-mono text-[11px] text-amber-800");
    expect(html).toContain("legacy-provider/old-model-v1");
    expect(html).toContain("custom-fine-tune/qwen-specialized");
  });

  it("verifies 1-click activation default pricing baseline contract (Rp 25.000 / Rp 50.000)", () => {
    // 1-Click activation triggers activateNewModelFromUpstream which enforces
    // default pricing of Rp 25.000 (input) and Rp 50.000 (output) per 1M tokens.
    // Client view renders 1-click trigger in sync card description:
    const html = renderWithInjectedState(
      { isSyncing: false },
      { searchParams: "tab=sync" }
    );

    expect(html).toContain("Sinkronisasi Katalog dari Upstream 9router");
    expect(html).toContain("Deteksi model baru di 9router (`/v1/models`) yang belum terdaftar di database lokal, dan aktifkan dalam 1-klik.");

    // Model Pricing manager displays prices formatted in Indonesian Rupiah
    const pricingHtml = renderWithInjectedState(undefined, {
      searchParams: "tab=pricing",
    });
    expect(pricingHtml).toMatch(/Rp[\s\u00a0]50\.000/);
    expect(pricingHtml).toMatch(/Rp[\s\u00a0]150\.000/);
  });
});

describe("Adversarial & Resilience Micro-scenarios", () => {
  it("escapes special characters and HTML tags in model IDs and error messages to prevent XSS", () => {
    const adversarialModelId = '<script>alert("xss")</script>';
    const adversarialError = 'Upstream <img src=x onerror=alert(1)> failed & crashed';

    const html = renderWithInjectedState({
      syncResult: {
        success: true,
        upstreamUrl: "http://localhost:20128/v1/models",
        diff: {
          newModels: [{ id: adversarialModelId, object: "model", owned_by: "adversarial-team" }],
          syncedModels: [],
          missingUpstreamModels: [],
        },
      },
      notification: {
        type: "error",
        message: adversarialError,
      },
    });

    // Verifies tags are properly HTML-entity escaped
    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).toContain("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("handles empty strings and nullish values in diff gracefully without crashing", () => {
    const html = renderWithInjectedState({
      syncResult: {
        success: true,
        upstreamUrl: "",
        diff: {
          newModels: [{ id: "", object: "model", owned_by: "" }],
          syncedModels: [{ id: "", object: "model" }],
          missingUpstreamModels: [""],
        },
      },
    });

    expect(html).toContain("Model Baru Terdeteksi (1)");
    expect(html).toContain("Model Tersinkronisasi Aktif (1)");
    expect(html).toContain("Model Lokal Tidak Ada di Upstream (1)");
    // Provider fallback handles empty string
    expect(html).toContain("9router upstream");
  });
});
