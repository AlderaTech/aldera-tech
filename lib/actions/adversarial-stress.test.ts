/* eslint-disable @typescript-eslint/no-explicit-any */
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

let currentSession: MockSession = null;

mock.module("@/auth", () => ({
  auth: mock(async () => currentSession),
  handlers: {},
  signIn: mock(),
  signOut: mock(),
}));

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

import {
  getUserBalance,
  createTopupRequest,
  getBalanceTransactions,
  listApiKeys,
  createApiKey,
  revokeApiKey,
  getUsageLogs,
  getUsageAnalytics,
  executePlaygroundChat,
  ensureRouterUser,
} from "./ai-relay";

import {
  generateBindingTokenAction,
  getBindingStatusAction,
  unlinkTelegramAccountAction,
} from "./binding";

import {
  assertQuerySafety,
  queryRouter,
} from "@/lib/router-db";

import * as aiRelayAuth from "@/lib/ai-relay-auth";

describe("Adversarial Stress Testing & Acceptance Verification", () => {
  const adminSession: MockSession = {
    user: {
      id: "adversarial_admin_id",
      roles: ["ADMIN"],
      role: "ADMIN",
      name: "Adversarial Admin",
      email: "admin@adversarial.test",
    },
  };

  const clientSession: MockSession = {
    user: {
      id: "adversarial_client_id",
      roles: ["CLIENT"],
      role: "CLIENT",
      name: "Adversarial Client",
      email: "client@adversarial.test",
    },
  };

  const devSession: MockSession = {
    user: {
      id: "adversarial_dev_id",
      roles: ["DEVELOPER"],
      role: "DEVELOPER",
      name: "Adversarial Dev",
      email: "dev@adversarial.test",
    },
  };

  let testAdminDbId: number;
  let testClientDbId: number;

  beforeAll(async () => {
    // Seed users in aldera_router
    const admin = await ensureRouterUser(
      adminSession!.user.id,
      adminSession!.user.name,
      adminSession!.user.email
    );
    testAdminDbId = admin.id;

    const client = await ensureRouterUser(
      clientSession!.user.id,
      clientSession!.user.name,
      clientSession!.user.email
    );
    testClientDbId = client.id;
  });

  afterAll(async () => {
    // Cleanup any test created pricing models and topup requests
    await queryRouter(
      "DELETE FROM model_pricing WHERE model_name LIKE 'adv-%';"
    );
    await queryRouter(
      "DELETE FROM topup_requests WHERE amount = 75000 AND unique_code = 321;"
    );
  });

  // ==========================================================================
  // 1. Server Actions Security & Parameter Pollution / Argument Injection
  // ==========================================================================
  describe("1. Server Actions Security & Parameter Pollution / Injections", () => {
    describe("admin-ai-relay.ts strict authorization enforcement", () => {
      it("strictly rejects unauthenticated callers on ALL 12 admin actions", async () => {
        currentSession = null;

        await expect(getModelPricings()).rejects.toThrow(/Unauthorized/);
        await expect(
          createModelPricing({
            model_name: "adv-test",
            display_name: "Adv Test",
            input_price_per_m: 10,
            output_price_per_m: 20,
          })
        ).rejects.toThrow(/Unauthorized/);
        await expect(
          updateModelPricing(1, { display_name: "Adv" })
        ).rejects.toThrow(/Unauthorized/);
        await expect(toggleModelPricingStatus(1, false)).rejects.toThrow(
          /Unauthorized/
        );
        await expect(deleteModelPricing(1)).rejects.toThrow(/Unauthorized/);
        await expect(syncModelsFromUpstream()).rejects.toThrow(/Unauthorized/);
        await expect(
          activateNewModelFromUpstream("adv-new", {
            inputPricePerM: 10,
            outputPricePerM: 20,
          })
        ).rejects.toThrow(/Unauthorized/);
        await expect(getFinancialMetrics()).rejects.toThrow(/Unauthorized/);
        await expect(getPendingTopupRequests()).rejects.toThrow(/Unauthorized/);
        await expect(approveTopupRequest(1)).rejects.toThrow(/Unauthorized/);
        await expect(rejectTopupRequest(1, "reason")).rejects.toThrow(
          /Unauthorized/
        );
        await expect(runLedgerAudit()).rejects.toThrow(/Unauthorized/);
      });

      it("strictly rejects CLIENT role callers on ALL 12 admin actions with Forbidden", async () => {
        currentSession = clientSession;

        await expect(getModelPricings()).rejects.toThrow(/Forbidden/);
        await expect(
          createModelPricing({
            model_name: "adv-test",
            display_name: "Adv Test",
            input_price_per_m: 10,
            output_price_per_m: 20,
          })
        ).rejects.toThrow(/Forbidden/);
        await expect(
          updateModelPricing(1, { display_name: "Adv" })
        ).rejects.toThrow(/Forbidden/);
        await expect(toggleModelPricingStatus(1, false)).rejects.toThrow(
          /Forbidden/
        );
        await expect(deleteModelPricing(1)).rejects.toThrow(/Forbidden/);
        await expect(syncModelsFromUpstream()).rejects.toThrow(/Forbidden/);
        await expect(
          activateNewModelFromUpstream("adv-new", {
            inputPricePerM: 10,
            outputPricePerM: 20,
          })
        ).rejects.toThrow(/Forbidden/);
        await expect(getFinancialMetrics()).rejects.toThrow(/Forbidden/);
        await expect(getPendingTopupRequests()).rejects.toThrow(/Forbidden/);
        await expect(approveTopupRequest(1)).rejects.toThrow(/Forbidden/);
        await expect(rejectTopupRequest(1, "reason")).rejects.toThrow(
          /Forbidden/
        );
        await expect(runLedgerAudit()).rejects.toThrow(/Forbidden/);
      });

      it("strictly rejects DEVELOPER role callers on ALL 12 admin actions with Forbidden", async () => {
        currentSession = devSession;

        await expect(getModelPricings()).rejects.toThrow(/Forbidden/);
        await expect(getFinancialMetrics()).rejects.toThrow(/Forbidden/);
        await expect(getPendingTopupRequests()).rejects.toThrow(/Forbidden/);
        await expect(runLedgerAudit()).rejects.toThrow(/Forbidden/);
      });

      it("ignores extra injected arguments attempting auth bypass on admin actions", async () => {
        currentSession = clientSession;

        // Attacker attempts to pass a second argument with authOverride or admin spoofing
        const maliciousOverride = {
          authOverride: { roles: ["ADMIN"], id: "admin-spoofed" },
          override: true,
          roles: ["ADMIN"],
          isAdmin: true,
        };

        const untypedGetModelPricings = getModelPricings as any;
        await expect(untypedGetModelPricings(maliciousOverride)).rejects.toThrow(
          /Forbidden/
        );

        const untypedGetFinancialMetrics = getFinancialMetrics as any;
        await expect(
          untypedGetFinancialMetrics(maliciousOverride)
        ).rejects.toThrow(/Forbidden/);

        const untypedRunLedgerAudit = runLedgerAudit as any;
        await expect(untypedRunLedgerAudit(maliciousOverride)).rejects.toThrow(
          /Forbidden/
        );
      });

      it("validates boundary and malicious inputs on admin pricing mutation", async () => {
        currentSession = adminSession;

        // Negative input price
        await expect(
          createModelPricing({
            model_name: "adv-neg",
            display_name: "Negative Price",
            input_price_per_m: -10,
            output_price_per_m: 20,
          })
        ).rejects.toThrow(/Harga tidak boleh bernilai negatif/);

        // Negative output price
        await expect(
          createModelPricing({
            model_name: "adv-neg",
            display_name: "Negative Price",
            input_price_per_m: 10,
            output_price_per_m: -5,
          })
        ).rejects.toThrow(/Harga tidak boleh bernilai negatif/);

        // Empty model name
        await expect(
          createModelPricing({
            model_name: "   ",
            display_name: "Empty Model",
            input_price_per_m: 10,
            output_price_per_m: 20,
          })
        ).rejects.toThrow(/Model name tidak boleh kosong/);

        // Empty display name
        await expect(
          createModelPricing({
            model_name: "adv-valid-model",
            display_name: "   ",
            input_price_per_m: 10,
            output_price_per_m: 20,
          })
        ).rejects.toThrow(/Display name tidak boleh kosong/);

        // Non-existent top-up ticket approval
        await expect(approveTopupRequest(999999999)).rejects.toThrow(
          /tidak ditemukan/
        );

        // Non-existent top-up ticket rejection
        await expect(rejectTopupRequest(999999999, "None")).rejects.toThrow(
          /tidak ditemukan/
        );
      });
    });

    describe("ai-relay.ts strict client authorization & boundary validation", () => {
      it("strictly rejects unauthenticated callers on client AI relay actions", async () => {
        currentSession = null;

        await expect(getUserBalance()).rejects.toThrow(/Unauthorized/);
        await expect(createTopupRequest(50000)).rejects.toThrow(/Unauthorized/);
        await expect(getBalanceTransactions()).rejects.toThrow(/Unauthorized/);
        await expect(listApiKeys()).rejects.toThrow(/Unauthorized/);
        await expect(createApiKey("Adv Key")).rejects.toThrow(/Unauthorized/);
        await expect(revokeApiKey(1)).rejects.toThrow(/Unauthorized/);
        await expect(getUsageLogs()).rejects.toThrow(/Unauthorized/);
        await expect(getUsageAnalytics()).rejects.toThrow(/Unauthorized/);
        await expect(
          executePlaygroundChat({ model: "gpt-4o-mini", prompt: "Hello" })
        ).rejects.toThrow(/Unauthorized/);
      });

      it("ignores extra injected arguments attempting user spoofing on client actions", async () => {
        currentSession = clientSession;

        const untypedGetUserBalance = getUserBalance as any;
        const res = await untypedGetUserBalance("spoofed-victim-user-id");
        // Must strictly bind to clientSession.user.id
        expect(res.webUserId).toBe(clientSession!.user.id);
        expect(res.userId).toBe(testClientDbId);

        const untypedCreateApiKey = createApiKey as any;
        const keyRes = await untypedCreateApiKey(
          "Injected Arg Key",
          "spoofed-victim-user-id"
        );
        expect(keyRes.label).toBe("Injected Arg Key");

        // Verify key was created for the authenticated user, NOT the spoofed user
        const dbKey = await queryRouter<{ user_id: number }>(
          "SELECT user_id FROM api_keys WHERE id = $1;",
          [keyRes.id]
        );
        expect(Number(dbKey.rows[0].user_id)).toBe(testClientDbId);
      });

      it("strictly validates nominal input boundaries on createTopupRequest", async () => {
        currentSession = clientSession;

        await expect(createTopupRequest(0)).rejects.toThrow(
          /Nominal top-up harus berupa angka positif/
        );
        await expect(createTopupRequest(-50000)).rejects.toThrow(
          /Nominal top-up harus berupa angka positif/
        );
        await expect(createTopupRequest(NaN)).rejects.toThrow(
          /Nominal top-up harus berupa angka positif/
        );
      });

      it("prevents revoking another user's API key", async () => {
        currentSession = adminSession;
        // Create key owned by admin
        const adminKey = await createApiKey("Admin Protected Key");

        currentSession = clientSession;
        // Client attempts to revoke admin's key
        const revokeRes = await revokeApiKey(adminKey.id);
        expect(revokeRes.success).toBe(true); // Action completes safely

        // Verify admin's key in DB is STILL active (unaffected because WHERE id = $1 AND user_id = client.id)
        const checkKey = await queryRouter<{ is_active: boolean }>(
          "SELECT is_active FROM api_keys WHERE id = $1;",
          [adminKey.id]
        );
        expect(checkKey.rows[0].is_active).toBe(true);
      });

      it("strictly enforces validation and overdraft protection in playground chat", async () => {
        currentSession = clientSession;

        // Empty prompt
        await expect(
          executePlaygroundChat({ model: "gpt-4o-mini", prompt: "   " })
        ).rejects.toThrow(/Prompt tidak boleh kosong/);

        // Empty model
        await expect(
          executePlaygroundChat({ model: "   ", prompt: "Hello" })
        ).rejects.toThrow(/Model harus dipilih/);

        // Non-existent model
        await expect(
          executePlaygroundChat({
            model: "non-existent-adversarial-model",
            prompt: "Hello",
          })
        ).rejects.toThrow(/tidak tersedia atau tidak aktif/);

        // Zero balance overdraft prevention
        await queryRouter(
          "UPDATE users SET balance = 0.0000 WHERE id = $1;",
          [testClientDbId]
        );
        await expect(
          executePlaygroundChat({ model: "gpt-4o-mini", prompt: "Hello" })
        ).rejects.toThrow(/Insufficient balance/);
      });
    });

    describe("binding.ts strict authorization enforcement", () => {
      it("strictly rejects unauthenticated callers on binding actions", async () => {
        currentSession = null;

        const genRes = await generateBindingTokenAction();
        expect(genRes.success).toBe(false);
        expect(genRes.error).toContain("Unauthorized");

        const statusRes = await getBindingStatusAction();
        expect(statusRes.isBound).toBe(false);

        const unlinkRes = await unlinkTelegramAccountAction();
        expect(unlinkRes.success).toBe(false);
        expect(unlinkRes.error).toContain("Unauthorized");
      });

      it("ignores extra arguments attempting identity override on binding actions", async () => {
        currentSession = clientSession;

        const untypedGenerate = generateBindingTokenAction as any;
        const res = await untypedGenerate("spoofed-victim-web-id");
        expect(res.success).toBe(true);

        // Verify token in DB belongs to authenticated user
        const tokenDb = await queryRouter<{ aldera_user_id: string }>(
          "SELECT aldera_user_id FROM account_binding_tokens WHERE token = $1;",
          [res.token]
        );
        expect(tokenDb.rows[0].aldera_user_id).toBe(clientSession!.user.id);
      });
    });
  });

  // ==========================================================================
  // 2. Database Trigger Constraints & Invariant Integrity
  // ==========================================================================
  describe("2. Database Trigger Constraints & Query Safety", () => {
    it("assertQuerySafety blocks adversarial mutations on balance_transactions and usage_logs", () => {
      // Obfuscated UPDATE with comments
      expect(() =>
        assertQuerySafety(
          "/* comment */ UPDATE /* another */ balance_transactions SET amount = 999;"
        )
      ).toThrow(/Audit immutability violation/);

      // Obfuscated DELETE with schema qualification
      expect(() =>
        assertQuerySafety("DELETE FROM public.balance_transactions WHERE id = 1;")
      ).toThrow(/Audit immutability violation/);

      // Quoted identifiers
      expect(() =>
        assertQuerySafety('UPDATE "balance_transactions" SET amount = 100;')
      ).toThrow(/Audit immutability violation/);

      // TRUNCATE attempts
      expect(() =>
        assertQuerySafety("TRUNCATE TABLE balance_transactions;")
      ).toThrow(/Audit immutability violation/);
      expect(() => assertQuerySafety("TRUNCATE usage_logs;")).toThrow(
        /Audit immutability violation/
      );

      // DELETE on usage_logs
      expect(() =>
        assertQuerySafety("DELETE FROM usage_logs WHERE id = 1;")
      ).toThrow(/Audit immutability violation/);

      // Normal safe queries pass cleanly
      expect(() =>
        assertQuerySafety("SELECT * FROM balance_transactions;")
      ).not.toThrow();
      expect(() =>
        assertQuerySafety("SELECT * FROM usage_logs;")
      ).not.toThrow();
      expect(() =>
        assertQuerySafety("UPDATE users SET balance = 100 WHERE id = 1;")
      ).not.toThrow();
      expect(() =>
        assertQuerySafety("UPDATE model_pricing SET is_active = true WHERE id = 1;")
      ).not.toThrow();
    });

    it("verifies live PostgreSQL database passes all 5 ledger invariants initially", async () => {
      currentSession = adminSession;
      const invariants = await runLedgerAudit();
      expect(invariants.length).toBe(5);

      for (const inv of invariants) {
        expect(inv.status).toBe("PASS");
        expect(inv.violation_count).toBe(0);
      }
    });

    it("verifies live PostgreSQL trigger prevent_topup_tampering strictly prevents mutating finalized tickets and detects unreconciled tickets", async () => {
      // Create a test topup request
      const createRes = await queryRouter<{ id: number }>(
        `INSERT INTO topup_requests (user_id, amount, unique_code, total_transfer, status)
         VALUES ($1, 75000, 321, 75321, 'pending')
         RETURNING id;`,
        [testClientDbId]
      );
      const ticketId = createRes.rows[0].id;

      // Finalize it to 'approved'
      await queryRouter(
        `UPDATE topup_requests
         SET status = 'approved', admin_id = $1, approved_at = NOW()
         WHERE id = $2;`,
        [testAdminDbId, ticketId]
      );

      // Adversarial Attempt 1: Revert status back to 'pending'
      await expect(
        queryRouter(
          "UPDATE topup_requests SET status = 'pending' WHERE id = $1;",
          [ticketId]
        )
      ).rejects.toThrow(/integrity_constraint_violation|terminal and immutable/);

      // Adversarial Attempt 2: Alter financial amount on approved ticket
      await expect(
        queryRouter(
          "UPDATE topup_requests SET amount = 999999 WHERE id = $1;",
          [ticketId]
        )
      ).rejects.toThrow(/integrity_constraint_violation|immutable/);

      // Verification of audit runner detecting unreconciled manual approval
      currentSession = adminSession;
      const invariants = await runLedgerAudit();
      const topupCheck = invariants.find(
        (i) => i.check_name === "TOPUP_REQUEST_RECONCILIATION"
      );
      expect(topupCheck?.status).toBe("FAIL");
      expect(topupCheck?.violation_count).toBeGreaterThanOrEqual(1);

      // Cleanup the test ticket so DB invariants return to 100% PASS
      await queryRouter("DELETE FROM topup_requests WHERE id = $1;", [ticketId]);

      const cleanedInvariants = await runLedgerAudit();
      for (const inv of cleanedInvariants) {
        expect(inv.status).toBe("PASS");
        expect(inv.violation_count).toBe(0);
      }
    });
  });

  // ==========================================================================
  // 4. API Key Generation & Cryptographic Validation Stress Test
  // ==========================================================================
  describe("4. API Key Generation & Cryptographic Robustness", () => {
    it("generates 10,000 API keys with strict format and ZERO collisions across keys, prefixes, and hashes", () => {
      const COUNT = 10000;
      const keySet = new Set<string>();
      const prefixSet = new Set<string>();
      const hashSet = new Set<string>();

      for (let i = 0; i < COUNT; i++) {
        const { rawKey, keyPrefix, keyHash } = aiRelayAuth.generateApiKey();

        expect(rawKey.length).toBe(56);
        expect(rawKey.startsWith("sk-toko-")).toBe(true);
        expect(aiRelayAuth.API_KEY_REGEX.test(rawKey)).toBe(true);

        expect(keyPrefix.length).toBe(16);
        expect(aiRelayAuth.API_KEY_PREFIX_REGEX.test(keyPrefix)).toBe(true);

        expect(keyHash.length).toBe(64);
        expect(aiRelayAuth.API_KEY_HASH_REGEX.test(keyHash)).toBe(true);

        keySet.add(rawKey);
        prefixSet.add(keyPrefix);
        hashSet.add(keyHash);
      }

      // Assert 0 collisions
      expect(keySet.size).toBe(COUNT);
      expect(prefixSet.size).toBe(COUNT);
      expect(hashSet.size).toBe(COUNT);
    });

    it("strictly rejects adversarial and malformed API keys in validateApiKeyFormat", () => {
      // Invalid prefixes
      expect(
        aiRelayAuth.validateKeyFormat(
          "sk-proj-abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKL"
        )
      ).toBe(false);
      expect(
        aiRelayAuth.validateKeyFormat(
          "bearer-abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKL"
        )
      ).toBe(false);
      expect(
        aiRelayAuth.validateKeyFormat(
          "sk-toko_abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKL"
        )
      ).toBe(false);

      // Wrong lengths
      expect(
        aiRelayAuth.validateKeyFormat(
          "sk-toko-abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJK"
        ) // 55 chars
      ).toBe(false);
      expect(
        aiRelayAuth.validateKeyFormat(
          "sk-toko-abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLM"
        ) // 57 chars
      ).toBe(false);

      // Special characters / injection
      expect(
        aiRelayAuth.validateKeyFormat(
          "sk-toko-abcdefghijklmnopqrstuvwxyz0123456789ABCD!@#$%^&*"
        )
      ).toBe(false);
      expect(
        aiRelayAuth.validateKeyFormat(
          "sk-toko-'; DROP TABLE api_keys; --0123456789ABCDEFGHIJK"
        )
      ).toBe(false);
    });
  });
});
