import { describe, it, expect, beforeAll, afterAll, mock } from "bun:test";

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
  generateBindingToken,
  generateBindingCode,
  createBindingRecord,
  verifyBindingToken,
  formatTelegramModelsMessage,
  evaluateLowBalanceAlert,
  LOW_BALANCE_DEFAULT_THRESHOLD,
  ALERT_COOLDOWN_MS,
  type ModelCatalogItem,
} from "@/lib/ai-relay-utils";
import {
  generateBindingTokenAction,
  getBindingStatusAction,
  unlinkTelegramAccountAction,
} from "@/lib/actions/binding";
import { queryRouter } from "@/lib/router-db";
import {
  runBalanceGuard,
  ensureAlertCooldownsTable,
} from "@/lib/balance-guard";

const MOCK_MODELS: ModelCatalogItem[] = [
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
    id: "gpt-4o",
    displayName: "GPT-4o (Omni)",
    category: "Vision",
    contextWindow: 128000,
    inputPricePerM: 40000,
    outputPricePerM: 160000,
    bestFor: "Multimodal analysis",
    isActive: true,
  },
  {
    id: "deepseek-chat",
    displayName: "DeepSeek V3",
    category: "Budget",
    contextWindow: 64000,
    inputPricePerM: 2200,
    outputPricePerM: 8800,
    bestFor: "Ultra-affordable chat",
    isActive: true,
  },
  {
    id: "gpt-4o-mini",
    displayName: "GPT-4o Mini",
    category: "Fast",
    contextWindow: 128000,
    inputPricePerM: 2400,
    outputPricePerM: 9600,
    bestFor: "Fast completions",
    isActive: true,
  },
];

describe("Milestone 4: Omnichannel Web ↔ Telegram Bot & Alerts", () => {
  const testWebUserId = `test_web_${Date.now()}`;
  let testRouterUserId: number;

  beforeAll(async () => {
    await ensureAlertCooldownsTable();

    // Create a mock user in aldera_router.users
    const userRes = await queryRouter<{ id: number }>(
      `INSERT INTO users (web_user_id, full_name, username, balance, is_active)
       VALUES ($1, $2, $3, 5000.0000, true)
       RETURNING id;`,
      [testWebUserId, "Worker M4 Test User", `user_${testWebUserId.slice(-6)}`]
    );
    testRouterUserId = Number(userRes.rows[0].id);

    mockSession = {
      user: {
        id: testWebUserId,
        name: "Worker M4 Test User",
        email: "worker.m4@aldera.test",
        role: "CLIENT",
        roles: ["CLIENT"],
      },
    };
  });

  afterAll(async () => {
    try {
      // Clean up test data
      await queryRouter(
        "DELETE FROM user_alert_cooldowns WHERE user_id = $1;",
        [testRouterUserId]
      );
      await queryRouter(
        "DELETE FROM account_binding_tokens WHERE aldera_user_id = $1;",
        [testWebUserId]
      );
      await queryRouter("DELETE FROM users WHERE id = $1;", [testRouterUserId]);
    } catch {
      // Ignore cleanup error in test tear-down
    }
  });

  // ========================================================================
  // F11: Account Binding
  // ========================================================================
  describe("F11: Account Binding Pure Contracts", () => {
    it("generates cryptographically secure 64-char hex token", () => {
      const token = generateBindingToken();
      expect(token.length).toBe(64);
      expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
    });

    it("generates 6-digit numeric verification code strictly in [100000, 999999]", () => {
      const code = generateBindingCode();
      expect(code.length).toBe(6);
      expect(/^[0-9]{6}$/.test(code)).toBe(true);
      const num = parseInt(code, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    });

    it("creates binding record with 15-minute expiration window", () => {
      const before = Date.now();
      const record = createBindingRecord("test_user_abc");
      const after = Date.now();

      expect(record.token.length).toBe(64);
      expect(record.code.length).toBe(6);
      expect(record.aldera_user_id).toBe("test_user_abc");
      expect(record.used_at).toBeNull();

      const diff = record.expires_at.getTime() - before;
      expect(diff).toBeGreaterThanOrEqual(15 * 60 * 1000 - 100);
      expect(diff).toBeLessThanOrEqual(15 * 60 * 1000 + (after - before) + 100);
    });

    it("verifies valid unused binding token before expiration", () => {
      const record = createBindingRecord("test_user_abc");
      const checkToken = verifyBindingToken(record, record.token);
      expect(checkToken.valid).toBe(true);
      expect(checkToken.error).toBeUndefined();

      const checkCode = verifyBindingToken(record, record.code);
      expect(checkCode.valid).toBe(true);
      expect(checkCode.error).toBeUndefined();
    });

    it("rejects token verification after expiration (>15 mins)", () => {
      const record = createBindingRecord("test_user_abc");
      record.expires_at = new Date(Date.now() - 1000); // 1s ago

      const check = verifyBindingToken(record, record.token);
      expect(check.valid).toBe(false);
      expect(check.error).toContain("expired");
    });

    it("rejects replay attack when token has already been marked used", () => {
      const record = createBindingRecord("test_user_abc");
      record.used_at = new Date();

      const check = verifyBindingToken(record, record.token);
      expect(check.valid).toBe(false);
      expect(check.error).toContain("already been used");
    });

    it("rejects mismatched token and verification code", () => {
      const record = createBindingRecord("test_user_abc");
      const check = verifyBindingToken(record, "invalid_value");
      expect(check.valid).toBe(false);
      expect(check.error).toContain("Invalid binding token");
    });
  });

  describe("F11: Account Binding Server Actions Database Integration", () => {
    it("generates binding token in database and returns deep-link", async () => {
      const res = await generateBindingTokenAction();
      expect(res.success).toBe(true);
      expect(res.token).toBeDefined();
      expect(res.token?.length).toBe(64);
      expect(res.code).toBeDefined();
      expect(res.code?.length).toBe(6);
      expect(res.deepLink).toContain("start=bind_");
      expect(res.deepLink).toContain(res.token!);

      // Verify row exists in account_binding_tokens
      const dbRes = await queryRouter<{
        token: string;
        code: string;
        aldera_user_id: string;
      }>(
        "SELECT token, code, aldera_user_id FROM account_binding_tokens WHERE token = $1;",
        [res.token]
      );
      expect(dbRes.rows.length).toBe(1);
      expect(dbRes.rows[0].aldera_user_id).toBe(testWebUserId);
      expect(dbRes.rows[0].code).toBe(res.code!);
    });

    it("checks binding status and returns active token when unbound", async () => {
      const status = await getBindingStatusAction();
      expect(status.isBound).toBe(false);
      expect(status.activeToken).toBeDefined();
      expect(status.activeToken?.token.length).toBe(64);
    });

    it("unlinks Telegram account correctly", async () => {
      // Simulate account binding by setting telegram_id
      await queryRouter("UPDATE users SET telegram_id = $1 WHERE id = $2;", [
        998877,
        testRouterUserId,
      ]);

      let status = await getBindingStatusAction();
      expect(status.isBound).toBe(true);
      expect(Number(status.telegramId)).toBe(998877);

      const unlinkRes = await unlinkTelegramAccountAction();
      expect(unlinkRes.success).toBe(true);

      status = await getBindingStatusAction();
      expect(status.isBound).toBe(false);
    });

    it("rejects unauthenticated requests cleanly", async () => {
      mockSession = null;
      const res = await generateBindingTokenAction();
      expect(res.success).toBe(false);
      expect(res.error).toContain("Unauthorized");

      const status = await getBindingStatusAction();
      expect(status.isBound).toBe(false);

      const unlinkRes = await unlinkTelegramAccountAction();
      expect(unlinkRes.success).toBe(false);
      expect(unlinkRes.error).toContain("Unauthorized");

      // Restore session
      mockSession = {
        user: {
          id: testWebUserId,
          name: "Worker M4 Test User",
          email: "worker.m4@aldera.test",
          role: "CLIENT",
          roles: ["CLIENT"],
        },
      };
    });
  });

  // ========================================================================
  // F12: Telegram Bot Interactive /models Formatting
  // ========================================================================
  describe("F12: Telegram Bot /models Formatting", () => {
    it("wraps Model IDs in HTML code tags for tap-to-copy", () => {
      const msg = formatTelegramModelsMessage("Coding", MOCK_MODELS);
      expect(msg).toContain("<code>claude-3-5-sonnet-20241022</code>");
      expect(msg).toContain("Claude 3.5 Sonnet");
    });

    it("formats pricing in Indonesian Rupiah per 1M token", () => {
      const msg = formatTelegramModelsMessage("Coding", MOCK_MODELS);
      expect(msg).toContain("Rp ");
      expect(msg).toContain("1M");
      expect(msg).toContain("48.000");
    });

    it("formats context window with thousand separators and token unit", () => {
      const msg = formatTelegramModelsMessage("Coding", MOCK_MODELS);
      expect(msg).toContain("200.000 token");
    });

    it("filters output strictly by the requested category", () => {
      const codingMsg = formatTelegramModelsMessage("Coding", MOCK_MODELS);
      expect(codingMsg).toContain("Daftar Model AI Relay (Coding)");
      expect(codingMsg).toContain("Claude 3.5 Sonnet");
      expect(codingMsg).not.toContain("GPT-4o (Omni)");

      const visionMsg = formatTelegramModelsMessage("Vision", MOCK_MODELS);
      expect(visionMsg).toContain("Daftar Model AI Relay (Vision)");
      expect(visionMsg).toContain("GPT-4o (Omni)");
      expect(visionMsg).not.toContain("Claude 3.5 Sonnet");
    });

    it("handles empty categories gracefully", () => {
      const emptyMsg = formatTelegramModelsMessage("Reasoning", MOCK_MODELS);
      expect(emptyMsg).toContain("Tidak ada model aktif untuk kategori ini");
    });
  });

  // ========================================================================
  // F13: Multi-channel Low Balance Alerts
  // ========================================================================
  describe("F13: Multi-channel Low Balance Alerts Pure Logic", () => {
    it("defines standard low balance threshold and 12-hour cooldown", () => {
      expect(LOW_BALANCE_DEFAULT_THRESHOLD).toBe(5000);
      expect(ALERT_COOLDOWN_MS).toBe(12 * 60 * 60 * 1000);
    });

    it("triggers alert when balance is below threshold (Rp 10.000)", () => {
      const res = evaluateLowBalanceAlert({
        userId: 1,
        currentBalance: 7500,
        threshold: 10000,
        lastAlertSentAt: null,
        telegramId: 11223344,
        phone: "081234567890",
      });
      expect(res.shouldAlert).toBe(true);
      expect(res.telegramPayload).toBeDefined();
      expect(res.telegramPayload?.telegramId).toBe(11223344);
      expect(res.telegramPayload?.message).toContain("Rp 7.500");
      expect(res.whatsappPayload).toBeDefined();
      expect(res.whatsappPayload?.target).toBe("081234567890");
    });

    it("suppresses alert when balance is equal to or above threshold", () => {
      const resEqual = evaluateLowBalanceAlert({
        userId: 1,
        currentBalance: 10000,
        threshold: 10000,
        lastAlertSentAt: null,
      });
      expect(resEqual.shouldAlert).toBe(false);

      const resAbove = evaluateLowBalanceAlert({
        userId: 1,
        currentBalance: 15000,
        threshold: 10000,
        lastAlertSentAt: null,
      });
      expect(resAbove.shouldAlert).toBe(false);
    });

    it("suppresses duplicate alert within 12-hour cooldown window", () => {
      const now = new Date();
      const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
      const res = evaluateLowBalanceAlert({
        userId: 1,
        currentBalance: 3000,
        threshold: 10000,
        lastAlertSentAt: fourHoursAgo,
        now,
      });
      expect(res.shouldAlert).toBe(false);
      expect(res.reason).toContain("within 12h cooldown");
    });

    it("allows alert dispatch once 12-hour cooldown window has expired", () => {
      const now = new Date();
      const thirteenHoursAgo = new Date(now.getTime() - 13 * 60 * 60 * 1000);
      const res = evaluateLowBalanceAlert({
        userId: 1,
        currentBalance: 3000,
        threshold: 10000,
        lastAlertSentAt: thirteenHoursAgo,
        now,
      });
      expect(res.shouldAlert).toBe(true);
    });

    it("handles partial channel availability (telegram only / whatsapp only)", () => {
      const tgOnly = evaluateLowBalanceAlert({
        userId: 1,
        currentBalance: 2000,
        threshold: 10000,
        lastAlertSentAt: null,
        telegramId: 12345,
      });
      expect(tgOnly.shouldAlert).toBe(true);
      expect(tgOnly.telegramPayload).toBeDefined();
      expect(tgOnly.whatsappPayload).toBeUndefined();

      const waOnly = evaluateLowBalanceAlert({
        userId: 1,
        currentBalance: 2000,
        threshold: 10000,
        lastAlertSentAt: null,
        phone: "628111222333",
      });
      expect(waOnly.shouldAlert).toBe(true);
      expect(waOnly.telegramPayload).toBeUndefined();
      expect(waOnly.whatsappPayload).toBeDefined();
    });
  });

  describe("F13: Balance Guard Service Runner Integration", () => {
    it("runs Balance Guard check and records cooldown", async () => {
      // Ensure test user has telegram_id and balance < 10000 (currently 5000)
      await queryRouter(
        "UPDATE users SET telegram_id = $1, balance = 5000.0000 WHERE id = $2;",
        [554433, testRouterUserId]
      );

      const summary = await runBalanceGuard(10000);
      expect(summary.totalChecked).toBeGreaterThanOrEqual(1);

      // Verify test user cooldown record was created
      const cooldownRes = await queryRouter<{
        user_id: number;
        alert_count: number;
      }>(
        "SELECT user_id, alert_count FROM user_alert_cooldowns WHERE user_id = $1;",
        [testRouterUserId]
      );
      expect(cooldownRes.rows.length).toBe(1);
      expect(Number(cooldownRes.rows[0].alert_count)).toBeGreaterThanOrEqual(1);

      // Immediate rerun should suppress alert due to 12h cooldown
      const rerun = await runBalanceGuard(10000);
      expect(rerun.alertsSuppressed).toBeGreaterThanOrEqual(1);
    });
  });
});
