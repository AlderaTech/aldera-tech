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

let mockSession: MockSession = null;

mock.module("@/auth", () => ({
  auth: mock(async () => mockSession),
  handlers: {},
  signIn: mock(),
  signOut: mock(),
}));
import {
  generateUniqueCode,
  calculateTotalTransfer,
  calculateTokenCost,
  aggregateUsageLogs,
  calculateModelHealth,
  calculateMonthlyCost,
  generateIdePresetConfig,
  filterModelCatalog,
  type UsageLogRecord,
  type ModelCatalogItem,
} from "@/lib/ai-relay-utils";
import {
  ensureRouterUser,
  getUserBalance,
  createTopupRequest,
  getBalanceTransactions,
  listApiKeys,
  createApiKey,
  revokeApiKey,
  getUsageLogs,
  getUsageAnalytics,
  getModelCatalog,
  getModelHealthMetrics,
  executePlaygroundChat,
} from "./ai-relay";
import {
  queryRouter,
  closeRouterPool,
  verifyLedgerInvariants,
} from "@/lib/router-db";

describe("AI Relay Action Utilities & Calculations (F4 - F10)", () => {
  afterAll(async () => {
    await closeRouterPool();
  });

  // ==========================================================================
  // F4: Saldo, Top-up Flow & Ledger History Calculations
  // ==========================================================================
  describe("F4: Unique Code & Transfer Nominal Calculations", () => {
    it("generates 3-digit unique verification code strictly within [100, 999]", () => {
      for (let i = 0; i < 50; i++) {
        const code = generateUniqueCode();
        expect(code).toBeGreaterThanOrEqual(100);
        expect(code).toBeLessThanOrEqual(999);
        expect(Number.isInteger(code)).toBe(true);
      }
    });

    it("calculates total transfer = amount + uniqueCode accurately", () => {
      const amount = 100000;
      const code = 789;
      expect(calculateTotalTransfer(amount, code)).toBe(100789);
    });

    it("throws error for non-positive amount", () => {
      expect(() => calculateTotalTransfer(0, 500)).toThrow(/positive/);
      expect(() => calculateTotalTransfer(-50000, 500)).toThrow(/positive/);
    });

    it("throws error for unique code outside [100, 999]", () => {
      expect(() => calculateTotalTransfer(50000, 99)).toThrow(/range/);
      expect(() => calculateTotalTransfer(50000, 1000)).toThrow(/range/);
    });
  });

  // ==========================================================================
  // F6: Token Cost Calculation
  // ==========================================================================
  describe("F6: Token Cost Calculation", () => {
    it("calculates token cost based on input & output pricing per 1M tokens", () => {
      // 10,000 prompt at 40,000/1M = 400 IDR
      // 2,000 comp at 160,000/1M = 320 IDR
      // Total = 720 IDR
      const cost = calculateTokenCost(10000, 2000, 40000, 160000);
      expect(cost).toBe(720);
    });

    it("calculates fractional token costs with 4-decimal precision", () => {
      // 150 prompt at 2,500/1M = 0.375 IDR
      // 50 comp at 10,000/1M = 0.5 IDR
      // Total = 0.875 IDR
      const cost = calculateTokenCost(150, 50, 2500, 10000);
      expect(cost).toBe(0.875);
    });

    it("throws error when tokens are negative", () => {
      expect(() => calculateTokenCost(-10, 100, 2000, 4000)).toThrow(
        /negative/
      );
      expect(() => calculateTokenCost(10, -100, 2000, 4000)).toThrow(
        /negative/
      );
    });
  });

  // ==========================================================================
  // F5: Token Usage Analytics Aggregation
  // ==========================================================================
  describe("F5: Usage Logs Analytics Aggregation", () => {
    const mockLogs: UsageLogRecord[] = [
      {
        id: 1,
        user_id: 1,
        api_key_id: 10,
        model: "gpt-4o",
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_cost: 120,
        duration_ms: 800,
        is_stream: false,
        created_at: new Date("2026-10-14T10:00:00Z"),
      },
      {
        id: 2,
        user_id: 1,
        api_key_id: 10,
        model: "gpt-4o",
        prompt_tokens: 2000,
        completion_tokens: 1000,
        total_cost: 240,
        duration_ms: 1200,
        is_stream: true,
        created_at: new Date("2026-10-14T11:00:00Z"),
      },
      {
        id: 3,
        user_id: 1,
        api_key_id: 10,
        model: "claude-3-5-sonnet-20241022",
        prompt_tokens: 3000,
        completion_tokens: 1000,
        total_cost: 384,
        duration_ms: 1800,
        is_stream: true,
        created_at: new Date("2026-10-15T09:00:00Z"),
      },
    ];

    it("aggregates prompt, completion, total tokens and IDR costs accurately", () => {
      const summary = aggregateUsageLogs(mockLogs);
      expect(summary.totalPromptTokens).toBe(6000);
      expect(summary.totalCompletionTokens).toBe(2500);
      expect(summary.totalTokens).toBe(8500);
      expect(summary.totalCostIdr).toBe(744);
      expect(summary.totalRequests).toBe(3);
    });

    it("aggregates daily series correctly grouped by date", () => {
      const summary = aggregateUsageLogs(mockLogs);
      expect(summary.dailyStats.length).toBe(2);
      expect(summary.dailyStats[0].date).toBe("2026-10-14");
      expect(summary.dailyStats[0].totalTokens).toBe(4500);
      expect(summary.dailyStats[0].costIdr).toBe(360);
      expect(summary.dailyStats[1].date).toBe("2026-10-15");
      expect(summary.dailyStats[1].totalTokens).toBe(4000);
      expect(summary.dailyStats[1].costIdr).toBe(384);
    });

    it("computes per-model consumption breakdown accurately", () => {
      const summary = aggregateUsageLogs(mockLogs);
      expect(summary.modelBreakdown["gpt-4o"].tokens).toBe(4500);
      expect(summary.modelBreakdown["gpt-4o"].costIdr).toBe(360);
      expect(summary.modelBreakdown["gpt-4o"].requestCount).toBe(2);
      expect(summary.modelBreakdown["claude-3-5-sonnet-20241022"].tokens).toBe(
        4000
      );
      expect(summary.modelBreakdown["claude-3-5-sonnet-20241022"].costIdr).toBe(
        384
      );
      expect(
        summary.modelBreakdown["claude-3-5-sonnet-20241022"].requestCount
      ).toBe(1);
    });

    it("handles empty logs gracefully with zeroed summary", () => {
      const summary = aggregateUsageLogs([]);
      expect(summary.totalTokens).toBe(0);
      expect(summary.totalCostIdr).toBe(0);
      expect(summary.totalRequests).toBe(0);
      expect(summary.dailyStats.length).toBe(0);
      expect(Object.keys(summary.modelBreakdown).length).toBe(0);
    });
  });

  // ==========================================================================
  // F9: Live Status & Health Monitor
  // ==========================================================================
  describe("F9: Model Health Monitoring", () => {
    const logs: UsageLogRecord[] = [
      {
        id: 1,
        user_id: 1,
        api_key_id: 1,
        model: "claude-3-5-sonnet-20241022",
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_cost: 144,
        duration_ms: 1000,
        is_stream: true,
        created_at: new Date(),
      },
      {
        id: 2,
        user_id: 1,
        api_key_id: 1,
        model: "claude-3-5-sonnet-20241022",
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_cost: 144,
        duration_ms: 1000,
        is_stream: true,
        created_at: new Date(),
      },
    ];

    it("computes average latency and tokens/sec throughput accurately", () => {
      const health = calculateModelHealth("claude-3-5-sonnet-20241022", logs);
      expect(health.avgLatencyMs).toBe(1000);
      expect(health.tokensPerSec).toBe(500); // 1000 completion tokens in 2 seconds
      expect(health.status).toBe("operational");
      expect(health.totalRequests).toBe(2);
    });

    it("flags status as degraded if average latency exceeds 5000ms", () => {
      const slowLogs: UsageLogRecord[] = [
        {
          id: 1,
          user_id: 1,
          api_key_id: 1,
          model: "gpt-4o",
          prompt_tokens: 500,
          completion_tokens: 100,
          total_cost: 50,
          duration_ms: 6500,
          is_stream: false,
          created_at: new Date(),
        },
      ];
      const health = calculateModelHealth("gpt-4o", slowLogs);
      expect(health.status).toBe("degraded");
      expect(health.avgLatencyMs).toBe(6500);
    });

    it("returns operational default with 0 stats for unseen models", () => {
      const health = calculateModelHealth("unseen-model", logs);
      expect(health.totalRequests).toBe(0);
      expect(health.avgLatencyMs).toBe(0);
      expect(health.tokensPerSec).toBe(0);
      expect(health.status).toBe("operational");
    });
  });

  // ==========================================================================
  // F10: Side-by-Side Comparison & Cost Simulator
  // ==========================================================================
  describe("F10: Monthly Cost Simulator", () => {
    it("computes monthly cost accurately for given workload", () => {
      // 100 req/day, 2000 prompt, 500 completion
      // Claude 3.5 Sonnet: in 48,000, out 240,000
      // cost per req = (2000*48000 + 500*240000)/1e6 = (96M + 120M)/1e6 = 216 IDR
      // monthly = 30 * 100 * 216 = 648,000 IDR
      const cost = calculateMonthlyCost(100, 2000, 500, 48000, 240000);
      expect(cost).toBe(648000);
    });

    it("calculates cost difference and substantial savings between models", () => {
      // Claude 3.5 Sonnet vs DeepSeek V3 (in 2000, out 4000)
      // DeepSeek: cost/req = (2000*2000 + 500*4000)/1e6 = (4M + 2M)/1e6 = 6 IDR
      // monthly = 30 * 100 * 6 = 18,000 IDR
      const costSonnet = calculateMonthlyCost(100, 2000, 500, 48000, 240000);
      const costDeepSeek = calculateMonthlyCost(100, 2000, 500, 2000, 4000);
      expect(costSonnet).toBe(648000);
      expect(costDeepSeek).toBe(18000);
      expect(costSonnet - costDeepSeek).toBe(630000);
    });

    it("scales linearly with request volume", () => {
      const cost100 = calculateMonthlyCost(100, 1000, 200, 10000, 20000);
      const cost300 = calculateMonthlyCost(300, 1000, 200, 10000, 20000);
      expect(cost300).toBe(cost100 * 3);
    });

    it("returns 0 for 0 daily requests", () => {
      expect(calculateMonthlyCost(0, 1000, 500, 40000, 160000)).toBe(0);
    });
  });

  // ==========================================================================
  // F8: Preset Config Generator
  // ==========================================================================
  describe("F8: Preset Config Generator", () => {
    const params = {
      apiKey: "sk-toko-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
      baseUrl: "https://api.aldera.tech",
      modelId: "claude-3-5-sonnet-20241022",
    };

    it("generates valid JSON config for Cursor IDE", () => {
      const json = generateIdePresetConfig("cursor", params);
      const parsed = JSON.parse(json);
      expect(parsed["openai-api-key"]).toBe(params.apiKey);
      expect(parsed["openai-base-url"]).toBe("https://api.aldera.tech/v1");
      expect(parsed.model).toBe(params.modelId);
    });

    it("generates valid JSON config for Cline", () => {
      const json = generateIdePresetConfig("cline", params);
      const parsed = JSON.parse(json);
      expect(parsed.apiProvider).toBe("openai");
      expect(parsed.openAiBaseUrl).toBe("https://api.aldera.tech/v1");
      expect(parsed.openAiApiKey).toBe(params.apiKey);
      expect(parsed.openAiModelId).toBe(params.modelId);
      expect(typeof parsed.mcpServers).toBe("object");
    });

    it("generates valid JSON config for Roo Code", () => {
      const json = generateIdePresetConfig("roo", params);
      const parsed = JSON.parse(json);
      expect(parsed.apiProvider).toBe("openai-compatible");
      expect(parsed.baseUrl).toBe("https://api.aldera.tech/v1");
      expect(parsed.apiKey).toBe(params.apiKey);
      expect(parsed.modelId).toBe(params.modelId);
    });

    it("generates valid JSON config for Continue.dev", () => {
      const json = generateIdePresetConfig("continue", params);
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed.models)).toBe(true);
      expect(parsed.models[0].model).toBe(params.modelId);
      expect(parsed.models[0].apiBase).toBe("https://api.aldera.tech/v1");
      expect(parsed.models[0].apiKey).toBe(params.apiKey);
    });

    it("generates valid JSON config for OpenWebUI", () => {
      const json = generateIdePresetConfig("openwebui", params);
      const parsed = JSON.parse(json);
      expect(parsed.OPENAI_API_BASE_URL).toBe("https://api.aldera.tech/v1");
      expect(parsed.OPENAI_API_KEY).toBe(params.apiKey);
      expect(parsed.DEFAULT_MODELS).toBe(params.modelId);
    });
  });

  // ==========================================================================
  // F7: Interactive Model Catalog Filtering
  // ==========================================================================
  describe("F7: Model Catalog Filter", () => {
    const catalog: ModelCatalogItem[] = [
      {
        id: "gpt-4o",
        displayName: "GPT-4o (Omni)",
        category: "Vision",
        contextWindow: 128000,
        inputPricePerM: 45000,
        outputPricePerM: 180000,
        bestFor: "Multimodal and reasoning",
        isActive: true,
      },
      {
        id: "claude-3-5-sonnet-20241022",
        displayName: "Claude 3.5 Sonnet",
        category: "Coding",
        contextWindow: 200000,
        inputPricePerM: 48000,
        outputPricePerM: 240000,
        bestFor: "Advanced code generation",
        isActive: true,
      },
      {
        id: "deepseek-chat",
        displayName: "DeepSeek V3",
        category: "Budget",
        contextWindow: 64000,
        inputPricePerM: 2000,
        outputPricePerM: 4000,
        bestFor: "Ultra affordable chat",
        isActive: true,
      },
    ];

    it("filters catalog by Coding category", () => {
      const res = filterModelCatalog(catalog, { category: "Coding" });
      expect(res.length).toBe(1);
      expect(res[0].id).toBe("claude-3-5-sonnet-20241022");
    });

    it("filters catalog by text search query", () => {
      const res = filterModelCatalog(catalog, { search: "deepseek" });
      expect(res.length).toBe(1);
      expect(res[0].id).toBe("deepseek-chat");
    });

    it("returns all active models for All category and empty search", () => {
      const res = filterModelCatalog(catalog, { category: "All", search: "" });
      expect(res.length).toBe(3);
    });
  });

  // ==========================================================================
  // Database Actions Integration (aldera_router DB)
  // ==========================================================================
  describe("Database Integration: Users, Keys, Topup & Playground Relay", () => {
    const testWebUserId = `test_web_user_${Date.now()}`;
    let testUserId = 0;

    beforeAll(() => {
      mockSession = {
        user: {
          id: testWebUserId,
          name: "Test Worker Client",
          email: "worker.m2@aldera.test",
          role: "CLIENT",
          roles: ["CLIENT"],
        },
      };
    });

    it("creates or links user in aldera_router.users via ensureRouterUser", async () => {
      const user = await ensureRouterUser(
        testWebUserId,
        "Test Worker Client",
        "worker.m2@aldera.test"
      );
      expect(user.id).toBeGreaterThan(0);
      expect(user.balance).toBe(0);
      testUserId = user.id;

      // Repeat call returns existing record
      const repeat = await ensureRouterUser(testWebUserId);
      expect(repeat.id).toBe(user.id);
    });

    it("manages API key lifecycle: create, list, and revoke", async () => {
      // 1. Create key
      const created = await createApiKey("Test Development Key");
      expect(created.success).toBe(true);
      expect(created.rawKey.startsWith("sk-toko-")).toBe(true);
      expect(created.rawKey.length).toBe(56);
      expect(created.keyPrefix.length).toBe(16);
      expect(created.label).toBe("Test Development Key");

      // 2. List keys
      const keys = await listApiKeys();
      expect(keys.length).toBeGreaterThanOrEqual(1);
      const found = keys.find((k) => k.id === created.id);
      expect(found).toBeDefined();
      expect(found?.is_active).toBe(true);

      // 3. Revoke key
      const revoked = await revokeApiKey(created.id);
      expect(revoked.success).toBe(true);

      const keysAfter = await listApiKeys();
      const revokedKey = keysAfter.find((k) => k.id === created.id);
      expect(revokedKey?.is_active).toBe(false);
    });

    it("creates pending top-up ticket and queries transactions ledger", async () => {
      const topupRes = await createTopupRequest(100000);
      expect(topupRes.success).toBe(true);
      expect(topupRes.topup.amount).toBe(100000);
      expect(topupRes.topup.unique_code).toBeGreaterThanOrEqual(100);
      expect(topupRes.topup.unique_code).toBeLessThanOrEqual(999);
      expect(topupRes.topup.total_transfer).toBe(
        100000 + topupRes.topup.unique_code
      );
      expect(topupRes.topup.status).toBe("pending");

      const txs = await getBalanceTransactions(10);
      expect(Array.isArray(txs)).toBe(true);
    });

    it("fetches active model catalog from database", async () => {
      const catalog = await getModelCatalog();
      expect(catalog.length).toBeGreaterThanOrEqual(6);
      const sonnet = catalog.find((m) => m.id === "claude-3-5-sonnet-20241022");
      expect(sonnet).toBeDefined();
      expect(sonnet?.isActive).toBe(true);
    });

    it("executes playground chat, debits balance, and maintains ledger invariants", async () => {
      // Give test user an initial balance in database directly
      await queryRouter(
        "UPDATE users SET balance = 50000.0000 WHERE id = $1;",
        [testUserId]
      );
      // Record initial balance transaction to maintain sum invariant
      await queryRouter(
        `INSERT INTO balance_transactions (user_id, amount, transaction_type, reference_id, balance_before, balance_after, notes)
         VALUES ($1, 50000.0000, 'manual_adjust', 'test_seed', 0.0000, 50000.0000, 'Test initial credit');`,
        [testUserId]
      );

      const balBefore = await getUserBalance();
      expect(balBefore.balance).toBe(50000);

      // Execute chat
      const chatRes = await executePlaygroundChat({
        model: "gpt-4o-mini",
        prompt: "Hello Aldera AI Relay!",
        systemPrompt: "Test system assistant",
      });

      expect(chatRes.success).toBe(true);
      expect(chatRes.content.length).toBeGreaterThan(0);
      expect(chatRes.usage.promptTokens).toBeGreaterThan(0);
      expect(chatRes.usage.completionTokens).toBeGreaterThan(0);
      expect(chatRes.usage.totalCostIdr).toBeGreaterThan(0);
      expect(chatRes.newBalance).toBeLessThan(50000);

      // Verify balance in database matches newBalance
      const balAfter = await getUserBalance();
      expect(balAfter.balance).toBe(chatRes.newBalance);

      // Verify usage logs recorded
      const logs = await getUsageLogs(5);
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs[0].model).toBe("gpt-4o-mini");

      // Verify analytics aggregation from db
      const analytics = await getUsageAnalytics();
      expect(analytics.totalTokens).toBeGreaterThan(0);
      expect(analytics.totalCostIdr).toBeGreaterThan(0);

      // Verify model health metrics calculation
      const healthMetrics = await getModelHealthMetrics();
      expect(healthMetrics.length).toBeGreaterThanOrEqual(1);
      const miniHealth = healthMetrics.find((h) => h.model === "gpt-4o-mini");
      expect(miniHealth).toBeDefined();

      // Verify all 5 ledger invariants remain 100% PASS with 0 violations!
      const invariants = await verifyLedgerInvariants();
      for (const inv of invariants) {
        expect(inv.status).toBe("PASS");
        expect(inv.violation_count).toBe(0);
      }
    });

    it("rejects unauthenticated requests to client AI relay operations", async () => {
      mockSession = null;
      await expect(getUserBalance()).rejects.toThrow(/Unauthorized/);
      await expect(createTopupRequest(50000)).rejects.toThrow(/Unauthorized/);
      await expect(getBalanceTransactions()).rejects.toThrow(/Unauthorized/);
      await expect(listApiKeys()).rejects.toThrow(/Unauthorized/);
      await expect(createApiKey("Unauth")).rejects.toThrow(/Unauthorized/);
      await expect(revokeApiKey(1)).rejects.toThrow(/Unauthorized/);
      await expect(getUsageLogs()).rejects.toThrow(/Unauthorized/);
      await expect(getUsageAnalytics()).rejects.toThrow(/Unauthorized/);
      await expect(
        executePlaygroundChat({ model: "gpt-4o-mini", prompt: "Hello" })
      ).rejects.toThrow(/Unauthorized/);

      // Restore session
      mockSession = {
        user: {
          id: testWebUserId,
          name: "Test Worker Client",
          email: "worker.m2@aldera.test",
          role: "CLIENT",
          roles: ["CLIENT"],
        },
      };
    });
  });
});
