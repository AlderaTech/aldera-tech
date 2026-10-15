import { describe, it, expect, afterAll, beforeAll, mock } from "bun:test";

type MockSession = {
  user: {
    id: string;
    roles?: string[];
    role?: string;
    name?: string;
    email?: string;
  };
} | null;

let currentAuthSession: MockSession = {
  user: {
    id: "admin_test_user_m5",
    roles: ["ADMIN"],
    role: "ADMIN",
    name: "M5 Admin Tester",
    email: "m5.admin@aldera.test",
  },
};

mock.module("@/auth", () => ({
  auth: mock(async () => currentAuthSession),
  handlers: {},
  signIn: mock(),
  signOut: mock(),
}));

import {
  calculateGrossMarginPercentage,
  diffModelsWithUpstream,
  calculateFinancialMetrics,
  type NineRouterModelItem,
  type TopupRequestRecord,
  type UsageLogRecord,
} from "@/lib/ai-relay-utils";
import {
  getModelPricings,
  createModelPricing,
  updateModelPricing,
  toggleModelPricingStatus,
  deleteModelPricing,
  syncModelsFromUpstream,
  activateNewModelFromUpstream,
  getFinancialMetrics,
  getPendingTopupRequests,
  approveTopupRequest,
  rejectTopupRequest,
  runLedgerAudit,
} from "./admin-ai-relay";
import { queryRouter, closeRouterPool } from "@/lib/router-db";
import { ensureRouterUser, createTopupRequest, getUserBalance } from "@/lib/actions/ai-relay";

describe("Admin AI Operations & Relay Server Actions (M5: F14, F15, F16)", () => {
  const adminTestAuth = {
    id: "admin_test_user_m5",
    roles: ["ADMIN"],
    role: "ADMIN",
  };
  const devTestAuth = {
    id: "developer_test_user",
    roles: ["DEVELOPER"],
    role: "DEVELOPER",
  };
  const clientTestAuth = {
    id: "client_test_user",
    roles: ["CLIENT"],
    role: "CLIENT",
  };

  let testAdminRouterId: number;

  beforeAll(async () => {
    // Create test user and test admin in aldera_router.users
    await ensureRouterUser(
      "test_client_m5_web_id",
      "M5 Client Tester",
      "m5.client@aldera.test"
    );

    const admin = await ensureRouterUser(
      adminTestAuth.id,
      "M5 Admin Tester",
      "m5.admin@aldera.test"
    );
    testAdminRouterId = admin.id;
  });

  afterAll(async () => {
    // Cleanup temporary test models
    await queryRouter(
      "DELETE FROM model_pricing WHERE model_name LIKE 'test-%' OR model_name LIKE 'ag/test-%';"
    );
    await closeRouterPool();
  });

  // ==========================================================================
  // F14: Dynamic Pricing Manager & Gross Margin Calculations
  // ==========================================================================
  describe("F14: Gross Margin Calculations & Edge Cases", () => {
    it("T14.1: calculates gross profit margin percentage accurately", () => {
      // Selling: Rp 45,000, Upstream: Rp 30,000 -> Margin = (15,000 / 45,000) * 100 = 33.33%
      const margin = calculateGrossMarginPercentage(45000, 30000);
      expect(margin).toBe(33.33);
    });

    it("T14.2: computes 0% margin when selling price matches upstream cost", () => {
      const margin = calculateGrossMarginPercentage(50000, 50000);
      expect(margin).toBe(0);
    });

    it("T14.3: computes negative margin when sold at a loss below upstream cost", () => {
      // Selling: 20,000, Upstream: 30,000 -> Margin = (-10,000 / 20,000) * 100 = -50%
      const margin = calculateGrossMarginPercentage(20000, 30000);
      expect(margin).toBe(-50);
    });

    it("T14.4: computes 50% margin for 2x upstream markup", () => {
      const margin = calculateGrossMarginPercentage(100000, 50000);
      expect(margin).toBe(50);
    });

    it("T14.B1: handles 0 selling price with non-zero upstream cost as -100%", () => {
      const margin = calculateGrossMarginPercentage(0, 50000);
      expect(margin).toBe(-100);
    });

    it("T14.B2: handles 0 selling price and 0 upstream cost gracefully with 0% margin", () => {
      const margin = calculateGrossMarginPercentage(0, 0);
      expect(margin).toBe(0);
    });

    it("T14.B3: computes margin accurately for high-value prices (100,000,000 IDR)", () => {
      const margin = calculateGrossMarginPercentage(100_000_000, 70_000_000);
      expect(margin).toBe(30);
    });

    it("T14.B4: computes margin accurately with fractional percentage rounding", () => {
      const margin = calculateGrossMarginPercentage(30000, 20000);
      expect(margin).toBe(33.33);
    });

    it("T14.B5: computes 99% margin for massive markup", () => {
      const margin = calculateGrossMarginPercentage(100000, 1000);
      expect(margin).toBe(99);
    });
  });

  describe("F14: Model Pricing Database CRUD", () => {
    let createdModelId: number;

    it("lists seeded model pricings enriched with upstream margins", async () => {
      const pricings = await getModelPricings();
      expect(pricings.length).toBeGreaterThanOrEqual(6);

      const gpt4o = pricings.find((p) => p.model_name === "gpt-4o");
      expect(gpt4o).toBeDefined();
      expect(gpt4o?.input_price_per_m).toBe(45000);
      expect(gpt4o?.output_price_per_m).toBe(180000);
      expect(gpt4o?.upstream_input_cost_per_m).toBe(30000);
      expect(gpt4o?.input_gross_margin_pct).toBe(33.33);
      expect(gpt4o?.is_active).toBe(true);
    });

    it("creates a new model pricing entry with positive decimal prices", async () => {
      const result = await createModelPricing({
        model_name: "test-model-v1",
        display_name: "Test Model v1",
        input_price_per_m: 25000,
        output_price_per_m: 75000,
        is_active: true,
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeGreaterThan(0);
      createdModelId = result.id;

      // Verify in list
      const list = await getModelPricings();
      const found = list.find((p) => p.id === createdModelId);
      expect(found).toBeDefined();
      expect(found?.model_name).toBe("test-model-v1");
      expect(found?.display_name).toBe("Test Model v1");
    });

    it("updates display name and pricing for existing model", async () => {
      const updateRes = await updateModelPricing(createdModelId, {
        display_name: "Test Model v1 Updated",
        input_price_per_m: 30000,
        output_price_per_m: 90000,
      });
      expect(updateRes.success).toBe(true);

      const list = await getModelPricings();
      const updated = list.find((p) => p.id === createdModelId);
      expect(updated?.display_name).toBe("Test Model v1 Updated");
      expect(updated?.input_price_per_m).toBe(30000);
      expect(updated?.output_price_per_m).toBe(90000);
    });

    it("toggles active status of model pricing", async () => {
      const toggleRes = await toggleModelPricingStatus(createdModelId, false);
      expect(toggleRes.success).toBe(true);

      const list = await getModelPricings();
      const disabled = list.find((p) => p.id === createdModelId);
      expect(disabled?.is_active).toBe(false);

      // Re-enable
      await toggleModelPricingStatus(createdModelId, true);
      const list2 = await getModelPricings();
      const enabled = list2.find((p) => p.id === createdModelId);
      expect(enabled?.is_active).toBe(true);
    });

    it("deletes a test model pricing entry", async () => {
      const delRes = await deleteModelPricing(createdModelId);
      expect(delRes.success).toBe(true);

      const list = await getModelPricings();
      const found = list.find((p) => p.id === createdModelId);
      expect(found).toBeUndefined();
    });

    it("rejects invalid inputs on model creation", async () => {
      expect(
        createModelPricing({
          model_name: "",
          display_name: "Invalid",
          input_price_per_m: 10000,
          output_price_per_m: 20000,
        })
      ).rejects.toThrow(/Model name tidak boleh kosong/);

      expect(
        createModelPricing({
          model_name: "test-neg",
          display_name: "Negative Price",
          input_price_per_m: -5000,
          output_price_per_m: 20000,
        })
      ).rejects.toThrow(/Harga tidak boleh bernilai negatif/);
    });
  });

  // ==========================================================================
  // F15: 9router Model Sync
  // ==========================================================================
  describe("F15: 9router Model Sync & Diffing", () => {
    const upstreamModels: NineRouterModelItem[] = [
      { id: "gpt-4o", object: "model", created: 1700000000, owned_by: "openai" },
      { id: "gpt-4o-mini", object: "model", created: 1700000000, owned_by: "openai" },
      { id: "ag/gemini-3.8-flash-high", object: "model", created: 1700000000, owned_by: "ag" },
      { id: "ag/claude-opus-5-5-high", object: "model", created: 1700000000, owned_by: "ag" },
    ];
    const localModelIds = ["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet-20241022"];

    it("T15.1: identifies new models present in upstream but not locally", () => {
      const diff = diffModelsWithUpstream(upstreamModels, localModelIds);
      expect(diff.newModels.length).toBe(2);
      expect(diff.newModels.map((m) => m.id)).toEqual([
        "ag/gemini-3.8-flash-high",
        "ag/claude-opus-5-5-high",
      ]);
    });

    it("T15.2: identifies synced models present in both upstream and local DB", () => {
      const diff = diffModelsWithUpstream(upstreamModels, localModelIds);
      expect(diff.syncedModels.length).toBe(2);
      const syncedIds = diff.syncedModels.map((m) => m.id);
      expect(syncedIds).toContain("gpt-4o");
      expect(syncedIds).toContain("gpt-4o-mini");
    });

    it("T15.3: identifies local models missing from upstream", () => {
      const diff = diffModelsWithUpstream(upstreamModels, localModelIds);
      expect(diff.missingUpstreamModels).toContain("claude-3-5-sonnet-20241022");
    });

    it("T15.4: parses standard OpenAI /v1/models response object", () => {
      const sampleItem = upstreamModels[0];
      expect(sampleItem.object).toBe("model");
      expect(typeof sampleItem.id).toBe("string");
      expect(typeof sampleItem.owned_by).toBe("string");
    });

    it("T15.5: returns empty newModels when upstream and local are identical", () => {
      const diff = diffModelsWithUpstream(
        upstreamModels,
        upstreamModels.map((m) => m.id)
      );
      expect(diff.newModels.length).toBe(0);
      expect(diff.syncedModels.length).toBe(upstreamModels.length);
    });

    it("runs syncModelsFromUpstream with mock options and returns structured diff", async () => {
      const syncRes = await syncModelsFromUpstream({
        mockUpstreamModels: upstreamModels,
      });

      expect(syncRes.success).toBe(true);
      expect(Array.isArray(syncRes.diff.newModels)).toBe(true);
      expect(Array.isArray(syncRes.diff.syncedModels)).toBe(true);
      expect(Array.isArray(syncRes.diff.missingUpstreamModels)).toBe(true);
    });

    it("1-click activates a new model discovered from upstream", async () => {
      const newModelId = "ag/test-gemini-ultra-pro";
      const activateRes = await activateNewModelFromUpstream(newModelId, {
        displayName: "Gemini Ultra Pro",
        inputPricePerM: 35000,
        outputPricePerM: 70000,
      });

      expect(activateRes.success).toBe(true);
      expect(activateRes.id).toBeGreaterThan(0);

      // Verify in catalog
      const pricings = await getModelPricings();
      const activated = pricings.find((p) => p.model_name === newModelId);
      expect(activated).toBeDefined();
      expect(activated?.is_active).toBe(true);
      expect(activated?.display_name).toBe("Gemini Ultra Pro");
    });
  });

  // ==========================================================================
  // F16: Financial Metrics, Top-up Approval Queue & Invariant Audit
  // ==========================================================================
  describe("F16: Financial Metrics Aggregation", () => {
    const mockApprovedTopups: TopupRequestRecord[] = [
      {
        id: 1,
        user_id: 10,
        amount: 500000,
        unique_code: 123,
        total_transfer: 500123,
        proof_file_id: "p1",
        status: "approved",
        admin_id: 1,
        approved_at: new Date(),
        created_at: new Date(),
      },
      {
        id: 2,
        user_id: 20,
        amount: 250000,
        unique_code: 456,
        total_transfer: 250456,
        proof_file_id: "p2",
        status: "approved",
        admin_id: 1,
        approved_at: new Date(),
        created_at: new Date(),
      },
    ];

    const mockUsageLogs: UsageLogRecord[] = [
      {
        id: 1,
        user_id: 10,
        api_key_id: 1,
        model: "gpt-4o",
        prompt_tokens: 10000,
        completion_tokens: 5000,
        total_cost: 1200,
        duration_ms: 1200,
        is_stream: true,
        created_at: new Date(),
      },
    ];

    it("T16.1: computes total omzet from approved topups accurately", () => {
      const metrics = calculateFinancialMetrics(
        mockApprovedTopups,
        mockUsageLogs
      );
      expect(metrics.totalOmzet).toBe(750000);
    });

    it("T16.2: computes total tokens consumed across usage logs", () => {
      const metrics = calculateFinancialMetrics(
        mockApprovedTopups,
        mockUsageLogs
      );
      expect(metrics.totalTokens).toBe(15000);
    });

    it("T16.3: computes total usage cost and net margin accurately", () => {
      const metrics = calculateFinancialMetrics(
        mockApprovedTopups,
        mockUsageLogs
      );
      expect(metrics.totalUsageCost).toBe(1200);
      expect(metrics.netMargin).toBe(750000 - 1200);
    });

    it("fetches live financial metrics summary from database", async () => {
      const summary = await getFinancialMetrics();
      expect(typeof summary.totalOmzet).toBe("number");
      expect(typeof summary.totalTokens).toBe("number");
      expect(typeof summary.totalUsageCost).toBe("number");
      expect(typeof summary.netMargin).toBe("number");
      expect(summary.totalOmzet).toBeGreaterThanOrEqual(0);
      expect(summary.pendingCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("F16: Top-up Approval Workflow & Atomic Ledger Transactions", () => {
    let pendingTicketId: number;

    it("creates a pending top-up ticket and displays in approval queue", async () => {
      const topup = await createTopupRequest(150000);
      expect(topup.success).toBe(true);
      pendingTicketId = topup.topup.id;

      const queue = await getPendingTopupRequests();
      expect(queue.length).toBeGreaterThanOrEqual(1);

      const ticket = queue.find((t) => t.id === pendingTicketId);
      expect(ticket).toBeDefined();
      expect(ticket?.amount).toBe(150000);
      expect(ticket?.status).toBe("pending");
      expect(ticket?.user_name).toBe("M5 Admin Tester");
    });

    it("atomically approves top-up ticket, credits user balance and writes ledger", async () => {
      const balBefore = await getUserBalance();
      const approveRes = await approveTopupRequest(pendingTicketId);

      expect(approveRes.success).toBe(true);
      expect(approveRes.newBalance).toBe(balBefore.balance + 150000);

      // Verify user balance in DB matches
      const balAfter = await getUserBalance();
      expect(balAfter.balance).toBe(approveRes.newBalance);

      // Verify ticket is no longer in pending queue
      const queueAfter = await getPendingTopupRequests();
      expect(queueAfter.find((t) => t.id === pendingTicketId)).toBeUndefined();

      // Verify balance_transactions ledger entry created
      const txRows = await queryRouter(
        "SELECT * FROM balance_transactions WHERE reference_id = $1;",
        [String(pendingTicketId)]
      );
      expect(txRows.rows.length).toBe(1);
      const tx = txRows.rows[0];
      expect(tx.transaction_type).toBe("topup");
      expect(Number(tx.amount)).toBe(150000);
      expect(Number(tx.balance_after)).toBe(
        Number(tx.balance_before) + Number(tx.amount)
      );

      // Verify ticket marked approved with admin_id and approved_at
      const ticketRow = await queryRouter(
        "SELECT status, admin_id, approved_at FROM topup_requests WHERE id = $1;",
        [pendingTicketId]
      );
      expect(ticketRow.rows[0].status).toBe("approved");
      expect(Number(ticketRow.rows[0].admin_id)).toBe(testAdminRouterId);
      expect(ticketRow.rows[0].approved_at).not.toBeNull();
    });

    it("prevents double-approving already finalized ticket", async () => {
      expect(approveTopupRequest(pendingTicketId)).rejects.toThrow(
        /sudah diproses/
      );
    });

    it("rejects a pending top-up ticket cleanly", async () => {
      // Create ticket to reject
      const topup2 = await createTopupRequest(50000);
      const ticket2Id = topup2.topup.id;

      const rejectRes = await rejectTopupRequest(
        ticket2Id,
        "Bukti transfer buram"
      );
      expect(rejectRes.success).toBe(true);

      const ticketRow = await queryRouter(
        "SELECT status FROM topup_requests WHERE id = $1;",
        [ticket2Id]
      );
      expect(ticketRow.rows[0].status).toBe("rejected");
    });
  });

  describe("F16: Live Ledger Invariant Audit Runner", () => {
    it("executes verify_ledger_invariants() and returns PASS for all 5 invariants", async () => {
      const results = await runLedgerAudit();
      expect(results.length).toBe(5);

      const checkNames = results.map((r) => r.check_name);
      expect(checkNames).toContain("ROW_ARITHMETIC_INVARIANT");
      expect(checkNames).toContain("LIFETIME_SUM_INVARIANT");
      expect(checkNames).toContain("TRANSACTION_POLARITY_INVARIANT");
      expect(checkNames).toContain("USAGE_LOG_RECONCILIATION");
      expect(checkNames).toContain("TOPUP_REQUEST_RECONCILIATION");

      for (const inv of results) {
        expect(inv.status).toBe("PASS");
        expect(inv.violation_count).toBe(0);
      }
    });
  });

  // ==========================================================================
  // Security & Authorization Guard
  // ==========================================================================
  describe("Security: Role Guard Enforcement", () => {
    it("strictly rejects non-admin staff (DEVELOPER) from admin AI relay operations", async () => {
      currentAuthSession = { user: devTestAuth };
      await expect(getModelPricings()).rejects.toThrow(/Forbidden/);
      await expect(getFinancialMetrics()).rejects.toThrow(/Forbidden/);
      await expect(getPendingTopupRequests()).rejects.toThrow(/Forbidden/);
      await expect(runLedgerAudit()).rejects.toThrow(/Forbidden/);
    });

    it("strictly rejects clients (CLIENT) from admin AI relay operations", async () => {
      currentAuthSession = { user: clientTestAuth };
      await expect(getModelPricings()).rejects.toThrow(/Forbidden/);
      await expect(getFinancialMetrics()).rejects.toThrow(/Forbidden/);
      await expect(getPendingTopupRequests()).rejects.toThrow(/Forbidden/);
      await expect(runLedgerAudit()).rejects.toThrow(/Forbidden/);
    });

    it("strictly rejects unauthenticated callers from admin AI relay operations", async () => {
      currentAuthSession = null;
      await expect(getModelPricings()).rejects.toThrow(/Unauthorized/);
      await expect(getFinancialMetrics()).rejects.toThrow(/Unauthorized/);
      await expect(getPendingTopupRequests()).rejects.toThrow(/Unauthorized/);
      await expect(runLedgerAudit()).rejects.toThrow(/Unauthorized/);
    });
  });
});
