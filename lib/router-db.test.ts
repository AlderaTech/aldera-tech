import { describe, it, expect, afterAll } from "bun:test";
import {
  getRouterPool,
  queryRouter,
  transactionRouter,
  verifyLedgerInvariants,
  assertQuerySafety,
  closeRouterPool,
} from "./router-db";

describe("Router Database Client & Invariants (`aldera_router`)", () => {
  afterAll(async () => {
    await closeRouterPool();
  });

  describe("Query Safety & Immutability Guard", () => {
    it("allows valid SELECT queries", () => {
      expect(() =>
        assertQuerySafety("SELECT * FROM balance_transactions")
      ).not.toThrow();
      expect(() => assertQuerySafety("SELECT * FROM usage_logs")).not.toThrow();
      expect(() =>
        assertQuerySafety("SELECT id, balance FROM users WHERE id = $1")
      ).not.toThrow();
    });

    it("allows valid INSERT queries on balance_transactions and usage_logs", () => {
      expect(() =>
        assertQuerySafety(
          "INSERT INTO balance_transactions (user_id, amount) VALUES (1, 100)"
        )
      ).not.toThrow();
      expect(() =>
        assertQuerySafety(
          "INSERT INTO usage_logs (user_id, model) VALUES (1, 'gpt-4o')"
        )
      ).not.toThrow();
    });

    it("allows valid UPDATE queries on mutable tables (users, model_pricing, api_keys)", () => {
      expect(() =>
        assertQuerySafety("UPDATE users SET balance = balance + 100 WHERE id = 1")
      ).not.toThrow();
      expect(() =>
        assertQuerySafety(
          "UPDATE model_pricing SET input_price_per_m = 1000 WHERE id = 1"
        )
      ).not.toThrow();
      expect(() =>
        assertQuerySafety(
          "UPDATE api_keys SET is_active = false WHERE id = 1"
        )
      ).not.toThrow();
    });

    it("rejects UPDATE on balance_transactions", () => {
      expect(() =>
        assertQuerySafety(
          "UPDATE balance_transactions SET notes = 'tampered' WHERE id = 1"
        )
      ).toThrow(/Audit immutability violation/);

      expect(() =>
        assertQuerySafety(
          "update public.balance_transactions set amount = 0 where id = 1"
        )
      ).toThrow(/Audit immutability violation/);
    });

    it("rejects DELETE on balance_transactions", () => {
      expect(() =>
        assertQuerySafety("DELETE FROM balance_transactions WHERE id = 1")
      ).toThrow(/Audit immutability violation/);

      expect(() =>
        assertQuerySafety("delete from public.balance_transactions")
      ).toThrow(/Audit immutability violation/);
    });

    it("rejects TRUNCATE on balance_transactions", () => {
      expect(() =>
        assertQuerySafety("TRUNCATE TABLE balance_transactions")
      ).toThrow(/Audit immutability violation/);

      expect(() =>
        assertQuerySafety("truncate balance_transactions")
      ).toThrow(/Audit immutability violation/);
    });

    it("rejects DELETE on usage_logs", () => {
      expect(() =>
        assertQuerySafety("DELETE FROM usage_logs WHERE id = 1")
      ).toThrow(/Audit immutability violation/);

      expect(() =>
        assertQuerySafety("delete from public.usage_logs where user_id = 2")
      ).toThrow(/Audit immutability violation/);
    });

    it("rejects TRUNCATE on usage_logs", () => {
      expect(() => assertQuerySafety("TRUNCATE TABLE usage_logs")).toThrow(
        /Audit immutability violation/
      );
    });

    it("intercepts all 19 adversarial SQL bypass variants (comments, ONLY, quotes, schema spacing)", () => {
      const bypassVariants = [
        "UPDATE/*comment*/balance_transactions SET amount = 0",
        "UPDATE/**/balance_transactions SET amount = 0",
        "UPDATE\n/*comment*/\nbalance_transactions SET amount = 0",
        "DELETE/**/FROM balance_transactions WHERE id = 1",
        "DELETE/*comment*/FROM balance_transactions WHERE id = 1",
        "DELETE FROM/**/balance_transactions WHERE id = 1",
        "DELETE--comment\nFROM balance_transactions WHERE id = 1",
        "DELETE FROM ONLY balance_transactions WHERE id = 1",
        "DELETE FROM ONLY usage_logs WHERE id = 1",
        "UPDATE ONLY balance_transactions SET amount = 0",
        "TRUNCATE ONLY balance_transactions",
        "TRUNCATE TABLE ONLY balance_transactions",
        "TRUNCATE ONLY usage_logs",
        "TRUNCATE TABLE ONLY usage_logs",
        'UPDATE"balance_transactions" SET amount = 0',
        'UPDATE "public" . "balance_transactions" SET amount = 0',
        'DELETE FROM "public" . "balance_transactions"',
        "WITH d AS (DELETE FROM ONLY balance_transactions) SELECT 1;",
        "WITH u AS (UPDATE ONLY balance_transactions SET amount = 0) SELECT 1;",
      ];

      for (const sql of bypassVariants) {
        expect(() => assertQuerySafety(sql)).toThrow(
          /Audit immutability violation/
        );
      }
    });

    it("handles empty or non-string inputs safely without throwing", () => {
      expect(() => assertQuerySafety("")).not.toThrow();
      expect(() => assertQuerySafety(null as unknown as string)).not.toThrow();
      expect(() =>
        assertQuerySafety(undefined as unknown as string)
      ).not.toThrow();
    });
  });

  describe("Connection Pool & Direct Execution", () => {
    it("returns singleton pool instance", () => {
      const pool1 = getRouterPool();
      const pool2 = getRouterPool();
      expect(pool1).toBe(pool2);
    });

    it("executes basic parameterized queries successfully", async () => {
      const res = await queryRouter<{ sum: number }>(
        "SELECT $1::int + $2::int AS sum;",
        [15, 27]
      );
      expect(res.rows.length).toBe(1);
      expect(Number(res.rows[0].sum)).toBe(42);
    });

    it("blocks forbidden queries at the queryRouter boundary before DB execution", async () => {
      await expect(
        queryRouter(
          "UPDATE balance_transactions SET notes = 'fail' WHERE id = 1"
        )
      ).rejects.toThrow(/Audit immutability violation/);
    });
  });

  describe("Transaction Helper", () => {
    it("commits transactions when operations succeed", async () => {
      const result = await transactionRouter(async (client) => {
        const queryRes = await client.query("SELECT 99 as val;");
        return Number(queryRes.rows[0].val);
      });
      expect(result).toBe(99);
    });

    it("rolls back transactions and propagates errors on failure", async () => {
      let rolledBack = false;
      try {
        await transactionRouter(async (client) => {
          await client.query("SELECT 1;");
          throw new Error("Simulated transaction failure");
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          expect(err.message).toBe("Simulated transaction failure");
        } else {
          throw new Error("Expected err to be an instance of Error");
        }
        rolledBack = true;
      }
      expect(rolledBack).toBe(true);
    });

    it("blocks forbidden queries inside transactions", async () => {
      await expect(
        transactionRouter(async (client) => {
          await client.query(
            "DELETE FROM balance_transactions WHERE user_id = 999"
          );
        })
      ).rejects.toThrow(/Audit immutability violation/);
    });
  });

  describe("Ledger Financial Invariants Verification", () => {
    it("verifies that all 5 ledger invariants PASS with 0 violations", async () => {
      const results = await verifyLedgerInvariants();

      expect(results.length).toBe(5);

      const checkNames = results.map((r) => r.check_name);
      expect(checkNames).toContain("ROW_ARITHMETIC_INVARIANT");
      expect(checkNames).toContain("LIFETIME_SUM_INVARIANT");
      expect(checkNames).toContain("TRANSACTION_POLARITY_INVARIANT");
      expect(checkNames).toContain("USAGE_LOG_RECONCILIATION");
      expect(checkNames).toContain("TOPUP_REQUEST_RECONCILIATION");

      for (const row of results) {
        expect(row.status).toBe("PASS");
        expect(row.violation_count).toBe(0);
      }
    });
  });
});
