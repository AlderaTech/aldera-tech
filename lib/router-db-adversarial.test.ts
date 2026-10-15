import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import type { PoolClient } from "pg";
import {
  getRouterPool,
  queryRouter,
  transactionRouter,
  verifyLedgerInvariants,
  closeRouterPool,
} from "./router-db";

describe("Milestone 1 Empirical Challenger: Database Triggers & Concurrency", () => {
  afterAll(async () => {
    await closeRouterPool();
  });

  // ==========================================================================
  // 1. Empirical Trigger Compliance: balance_transactions (prevent_audit_tampering)
  // ==========================================================================
  describe("1. balance_transactions Trigger Compliance (`prevent_audit_tampering`)", () => {
    let client: PoolClient;
    let isolatedUserId: number;
    let isolatedTxId: number;

    beforeAll(async () => {
      // Use an isolated transaction for trigger challenge to avoid polluting persistent state
      const pool = getRouterPool();
      client = await pool.connect();
      await client.query("BEGIN;");

      const userRes = await client.query<{ id: number }>(
        `INSERT INTO users (username, full_name, balance)
         VALUES ('challenger_audit_tx_user', 'Audit Tx User', 10000.0000)
         RETURNING id;`
      );
      isolatedUserId = Number(userRes.rows[0].id);

      const txRes = await client.query<{ id: number }>(
        `INSERT INTO balance_transactions (user_id, amount, transaction_type, balance_before, balance_after, notes)
         VALUES ($1, 10000.0000, 'topup', 0.0000, 10000.0000, 'audit test record')
         RETURNING id;`,
        [isolatedUserId]
      );
      isolatedTxId = Number(txRes.rows[0].id);
    });

    afterAll(async () => {
      try {
        await client.query("ROLLBACK;");
      } catch {
        // Ignore rollback failure if already completed
      } finally {
        client.release();
      }
    });

    it("verifies direct PostgreSQL UPDATE on balance_transactions triggers prevent_audit_tampering exception", async () => {
      let capturedError: unknown = null;

      try {
        // Savepoint so we don't abort the entire test transaction
        await client.query("SAVEPOINT sp_update_test;");
        await client.query(
          "UPDATE balance_transactions SET notes = 'tampered' WHERE id = $1;",
          [isolatedTxId]
        );
      } catch (err) {
        capturedError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_update_test;");
      }

      expect(capturedError).not.toBeNull();
      const dbError = capturedError as { message?: string; code?: string };
      expect(dbError.message).toContain(
        "Audit records in table balance_transactions are strictly append-only and immutable"
      );
      expect(dbError.message).toContain(
        "Modification (UPDATE) or deletion (DELETE) is forbidden for audit compliance."
      );
    });

    it("verifies direct PostgreSQL DELETE on balance_transactions triggers prevent_audit_tampering exception", async () => {
      let capturedError: unknown = null;

      try {
        await client.query("SAVEPOINT sp_delete_test;");
        await client.query("DELETE FROM balance_transactions WHERE id = $1;", [
          isolatedTxId,
        ]);
      } catch (err) {
        capturedError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_delete_test;");
      }

      expect(capturedError).not.toBeNull();
      const dbError = capturedError as { message?: string };
      expect(dbError.message).toContain(
        "Audit records in table balance_transactions are strictly append-only and immutable"
      );
      expect(dbError.message).toContain(
        "Modification (UPDATE) or deletion (DELETE) is forbidden for audit compliance."
      );
    });

    it("verifies direct PostgreSQL TRUNCATE on balance_transactions triggers prevent_truncate_audit exception", async () => {
      let capturedError: unknown = null;

      try {
        await client.query("SAVEPOINT sp_truncate_test;");
        await client.query("TRUNCATE TABLE balance_transactions;");
      } catch (err) {
        capturedError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_truncate_test;");
      }

      expect(capturedError).not.toBeNull();
      const dbError = capturedError as { message?: string };
      expect(dbError.message).toContain(
        "TRUNCATE on audit table balance_transactions is strictly forbidden"
      );
    });

    it("verifies queryRouter client-side guard blocks UPDATE and DELETE before reaching database", async () => {
      await expect(
        queryRouter(
          "UPDATE balance_transactions SET notes = 'tampered' WHERE id = 1"
        )
      ).rejects.toThrow(/Audit immutability violation/);

      await expect(
        queryRouter("DELETE FROM balance_transactions WHERE id = 1")
      ).rejects.toThrow(/Audit immutability violation/);
    });

    it("verifies transactionRouter client-side guard blocks mutations inside transactions", async () => {
      await expect(
        transactionRouter(async (txClient) => {
          await txClient.query(
            "UPDATE balance_transactions SET notes = 'in_tx' WHERE id = 1"
          );
        })
      ).rejects.toThrow(/Audit immutability violation/);
    });

    it("verifies SQL comment obfuscation bypassing client regex is halted by PostgreSQL trigger", async () => {
      let capturedError: unknown = null;

      try {
        await client.query("SAVEPOINT sp_obfuscate_test;");
        await client.query(
          `UPDATE/*evasion_comment*/balance_transactions SET notes = 'tampered' WHERE id = ${isolatedTxId};`
        );
      } catch (err) {
        capturedError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_obfuscate_test;");
      }

      expect(capturedError).not.toBeNull();
      const dbError = capturedError as { message?: string };
      expect(dbError.message).toContain(
        "Audit records in table balance_transactions are strictly append-only and immutable"
      );
    });
  });

  // ==========================================================================
  // 2. Empirical Trigger Compliance: topup_requests (prevent_topup_tampering)
  // ==========================================================================
  describe("2. topup_requests Trigger Compliance (`prevent_topup_tampering`)", () => {
    let client: PoolClient;
    let approvedTicketId: number;
    let rejectedTicketId: number;

    beforeAll(async () => {
      const pool = getRouterPool();
      client = await pool.connect();
      await client.query("BEGIN;");

      const userRes = await client.query<{ id: number }>(
        `INSERT INTO users (username, full_name, balance)
         VALUES ('challenger_topup_user', 'Topup Challenger User', 0.0000)
         RETURNING id;`
      );
      const testUserId = Number(userRes.rows[0].id);

      // Create approved ticket
      const approvedRes = await client.query<{ id: number }>(
        `INSERT INTO topup_requests (user_id, amount, unique_code, total_transfer, proof_file_id, status)
         VALUES ($1, 50000.0000, 245, 50245.0000, 'receipt_approved.jpg', 'pending')
         RETURNING id;`,
        [testUserId]
      );
      approvedTicketId = Number(approvedRes.rows[0].id);

      await client.query(
        `UPDATE topup_requests
         SET status = 'approved', admin_id = 9999, approved_at = NOW()
         WHERE id = $1;`,
        [approvedTicketId]
      );

      // Create rejected ticket
      const rejectedRes = await client.query<{ id: number }>(
        `INSERT INTO topup_requests (user_id, amount, unique_code, total_transfer, proof_file_id, status)
         VALUES ($1, 75000.0000, 312, 75312.0000, 'receipt_rejected.jpg', 'pending')
         RETURNING id;`,
        [testUserId]
      );
      rejectedTicketId = Number(rejectedRes.rows[0].id);

      await client.query(
        `UPDATE topup_requests
         SET status = 'rejected'
         WHERE id = $1;`,
        [rejectedTicketId]
      );
    });

    afterAll(async () => {
      try {
        await client.query("ROLLBACK;");
      } catch {
        // Ignore rollback failure if already completed
      } finally {
        client.release();
      }
    });

    it("rejects status transition from approved to pending (status terminality)", async () => {
      let capturedError: unknown = null;
      try {
        await client.query("SAVEPOINT sp_topup_1;");
        await client.query(
          "UPDATE topup_requests SET status = 'pending' WHERE id = $1;",
          [approvedTicketId]
        );
      } catch (err) {
        capturedError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_topup_1;");
      }

      expect(capturedError).not.toBeNull();
      const dbError = capturedError as { message?: string };
      expect(dbError.message).toContain("status is terminal and immutable");
    });

    it("rejects status transition from approved to rejected", async () => {
      let capturedError: unknown = null;
      try {
        await client.query("SAVEPOINT sp_topup_2;");
        await client.query(
          "UPDATE topup_requests SET status = 'rejected' WHERE id = $1;",
          [approvedTicketId]
        );
      } catch (err) {
        capturedError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_topup_2;");
      }

      expect(capturedError).not.toBeNull();
      const dbError = capturedError as { message?: string };
      expect(dbError.message).toContain("status is terminal and immutable");
    });

    it("rejects financial mutations on approved ticket (amount tampering)", async () => {
      let capturedError: unknown = null;
      try {
        await client.query("SAVEPOINT sp_topup_3;");
        await client.query(
          "UPDATE topup_requests SET amount = 999999.0000 WHERE id = $1;",
          [approvedTicketId]
        );
      } catch (err) {
        capturedError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_topup_3;");
      }

      expect(capturedError).not.toBeNull();
      const dbError = capturedError as { message?: string };
      expect(dbError.message).toContain("financial details are immutable");
    });

    it("rejects user_id mutation on approved ticket", async () => {
      let capturedError: unknown = null;
      try {
        await client.query("SAVEPOINT sp_topup_4;");
        await client.query(
          "UPDATE topup_requests SET user_id = 99999 WHERE id = $1;",
          [approvedTicketId]
        );
      } catch (err) {
        capturedError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_topup_4;");
      }

      expect(capturedError).not.toBeNull();
      const dbError = capturedError as { message?: string };
      expect(dbError.message).toContain("financial details are immutable");
    });

    it("rejects unique_code mutation on approved ticket", async () => {
      let capturedError: unknown = null;
      try {
        await client.query("SAVEPOINT sp_topup_5;");
        await client.query(
          "UPDATE topup_requests SET unique_code = 999 WHERE id = $1;",
          [approvedTicketId]
        );
      } catch (err) {
        capturedError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_topup_5;");
      }

      expect(capturedError).not.toBeNull();
      const dbError = capturedError as { message?: string };
      expect(dbError.message).toContain("financial details are immutable");
    });

    it("rejects admin_id audit metadata mutation on approved ticket", async () => {
      let capturedError: unknown = null;
      try {
        await client.query("SAVEPOINT sp_topup_6;");
        await client.query(
          "UPDATE topup_requests SET admin_id = 1111 WHERE id = $1;",
          [approvedTicketId]
        );
      } catch (err) {
        capturedError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_topup_6;");
      }

      expect(capturedError).not.toBeNull();
      const dbError = capturedError as { message?: string };
      expect(dbError.message).toContain("approval audit metadata is immutable");
    });

    it("rejects proof_file_id replacement on approved ticket", async () => {
      let capturedError: unknown = null;
      try {
        await client.query("SAVEPOINT sp_topup_7;");
        await client.query(
          "UPDATE topup_requests SET proof_file_id = 'tampered_receipt.jpg' WHERE id = $1;",
          [approvedTicketId]
        );
      } catch (err) {
        capturedError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_topup_7;");
      }

      expect(capturedError).not.toBeNull();
      const dbError = capturedError as { message?: string };
      expect(dbError.message).toContain("transfer proof is immutable");
    });

    it("rejects status transition from rejected to approved or pending", async () => {
      let capturedApprovedError: unknown = null;
      try {
        await client.query("SAVEPOINT sp_topup_8;");
        await client.query(
          "UPDATE topup_requests SET status = 'approved', admin_id = 1, approved_at = NOW() WHERE id = $1;",
          [rejectedTicketId]
        );
      } catch (err) {
        capturedApprovedError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_topup_8;");
      }

      expect(capturedApprovedError).not.toBeNull();
      const dbError1 = capturedApprovedError as { message?: string };
      expect(dbError1.message).toContain("status is terminal and immutable");

      let capturedPendingError: unknown = null;
      try {
        await client.query("SAVEPOINT sp_topup_9;");
        await client.query(
          "UPDATE topup_requests SET status = 'pending' WHERE id = $1;",
          [rejectedTicketId]
        );
      } catch (err) {
        capturedPendingError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_topup_9;");
      }

      expect(capturedPendingError).not.toBeNull();
      const dbError2 = capturedPendingError as { message?: string };
      expect(dbError2.message).toContain("status is terminal and immutable");
    });

    it("rejects financial details mutation on rejected ticket", async () => {
      let capturedError: unknown = null;
      try {
        await client.query("SAVEPOINT sp_topup_10;");
        await client.query(
          "UPDATE topup_requests SET amount = 100000.0000 WHERE id = $1;",
          [rejectedTicketId]
        );
      } catch (err) {
        capturedError = err;
        await client.query("ROLLBACK TO SAVEPOINT sp_topup_10;");
      }

      expect(capturedError).not.toBeNull();
      const dbError = capturedError as { message?: string };
      expect(dbError.message).toContain("financial details are immutable");
    });

    it("permits legitimate lifecycle transitions on pending tickets", async () => {
      const pendingRes = await client.query<{ id: number; user_id: number }>(
        `INSERT INTO topup_requests (user_id, amount, unique_code, total_transfer, proof_file_id, status)
         SELECT id, 20000.0000, 111, 20111.0000, 'receipt_legit.jpg', 'pending'
         FROM users WHERE username = 'challenger_topup_user'
         RETURNING id, user_id;`
      );
      const ticketId = Number(pendingRes.rows[0].id);

      const updateRes = await client.query<{ status: string }>(
        `UPDATE topup_requests
         SET status = 'approved', admin_id = 9999, approved_at = NOW()
         WHERE id = $1
         RETURNING status;`,
        [ticketId]
      );
      expect(updateRes.rowCount).toBe(1);
      expect(updateRes.rows[0].status).toBe("approved");
    });
  });

  // ==========================================================================
  // 3. Empirical Ledger Invariants Verification (verifyLedgerInvariants)
  // ==========================================================================
  describe("3. verifyLedgerInvariants() Live Verification", () => {
    it("returns all 5 financial ledger invariants with status PASS and 0 violations", async () => {
      const results = await verifyLedgerInvariants();

      expect(results.length).toBe(5);

      const checkNames = results.map((r) => r.check_name);
      expect(checkNames).toContain("ROW_ARITHMETIC_INVARIANT");
      expect(checkNames).toContain("LIFETIME_SUM_INVARIANT");
      expect(checkNames).toContain("TRANSACTION_POLARITY_INVARIANT");
      expect(checkNames).toContain("USAGE_LOG_RECONCILIATION");
      expect(checkNames).toContain("TOPUP_REQUEST_RECONCILIATION");

      for (const check of results) {
        expect(check.status).toBe("PASS");
        expect(check.violation_count).toBe(0);
        expect(typeof check.details).toBe("string");
      }
    });

    it("empirically demonstrates verify_ledger_invariants detects financial discrepancy during drift", async () => {
      // In an isolated transactional block that rolls back:
      // We simulate an unrecorded balance drift in users.balance and verify LIFETIME_SUM_INVARIANT fails
      const pool = getRouterPool();
      const client = await pool.connect();

      try {
        await client.query("BEGIN;");

        // Insert a test user with matching balance and ledger transaction
        const userRes = await client.query<{ id: number }>(
          `INSERT INTO users (username, full_name, balance)
           VALUES ('drift_test_user', 'Drift Test User', 50000.0000)
           RETURNING id;`
        );
        const driftUserId = Number(userRes.rows[0].id);

        await client.query(
          `INSERT INTO balance_transactions (user_id, amount, transaction_type, balance_before, balance_after)
           VALUES ($1, 50000.0000, 'topup', 0.0000, 50000.0000);`,
          [driftUserId]
        );

        // Verify currently PASS
        const preCheck = await client.query<{
          status: string;
          violation_count: string;
        }>(
          `SELECT status, violation_count FROM verify_ledger_invariants() WHERE check_name = 'LIFETIME_SUM_INVARIANT';`
        );
        expect(preCheck.rows[0].status).toBe("PASS");
        expect(Number(preCheck.rows[0].violation_count)).toBe(0);

        // Intentionally create 1.0000 IDR unrecorded drift in users.balance
        await client.query(
          `UPDATE users SET balance = balance + 1.0000 WHERE id = $1;`,
          [driftUserId]
        );

        // verify_ledger_invariants() inside the transaction: LIFETIME_SUM_INVARIANT must detect FAIL!
        const postCheck = await client.query<{
          status: string;
          violation_count: string;
          details: string;
        }>(
          `SELECT status, violation_count, details FROM verify_ledger_invariants() WHERE check_name = 'LIFETIME_SUM_INVARIANT';`
        );
        expect(postCheck.rows[0].status).toBe("FAIL");
        expect(
          Number(postCheck.rows[0].violation_count)
        ).toBeGreaterThanOrEqual(1);
        expect(postCheck.rows[0].details).toContain(
          "users exhibit balance drift vs ledger sum"
        );

        // Clean rollback to leave zero trace
        await client.query("ROLLBACK;");
      } catch (err) {
        await client.query("ROLLBACK;");
        throw err;
      } finally {
        client.release();
      }
    });
  });

  // ==========================================================================
  // 4. Concurrency Stress Test: pg.Pool Connection Queuing & Resilience
  // ==========================================================================
  describe("4. Concurrent Pool Query Stress Testing", () => {
    it("handles 100 concurrent read queries without deadlocks or connection drops", async () => {
      const concurrency = 100;
      const startTime = Date.now();

      // Launch 100 simultaneous queries across the pool
      const tasks = Array.from({ length: concurrency }, async (_, i) => {
        const res = await queryRouter<{ n: number; now: Date }>(
          "SELECT $1::int AS n, NOW() as now;",
          [i]
        );
        return Number(res.rows[0].n);
      });

      const results = await Promise.all(tasks);
      const elapsedMs = Date.now() - startTime;

      expect(results.length).toBe(concurrency);
      for (let i = 0; i < concurrency; i++) {
        expect(results[i]).toBe(i);
      }
      expect(elapsedMs).toBeLessThan(10000); // 100 queries must complete well within 10s
    });

    it("handles 30 concurrent transactions with interleaved successes and failures cleanly", async () => {
      const concurrency = 30;

      const tasks = Array.from({ length: concurrency }, async (_, i) => {
        const isSuccess = i % 2 === 0;

        try {
          return await transactionRouter(async (client) => {
            const res = await client.query<{ val: number }>(
              "SELECT $1::int AS val;",
              [i]
            );
            if (!isSuccess) {
              throw new Error(`Simulated abort for worker ${i}`);
            }
            return Number(res.rows[0].val);
          });
        } catch (err) {
          return { error: (err as Error).message, index: i };
        }
      });

      const results = await Promise.all(tasks);
      expect(results.length).toBe(concurrency);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < concurrency; i++) {
        const res = results[i];
        if (typeof res === "number") {
          expect(res).toBe(i);
          successCount++;
        } else if (typeof res === "object" && res !== null && "error" in res) {
          expect(res.error).toContain(`Simulated abort for worker ${i}`);
          errorCount++;
        }
      }

      expect(successCount).toBe(15);
      expect(errorCount).toBe(15);

      // Verify pool continues to function normally immediately after high concurrency
      const postStressRes = await queryRouter<{ healthy: boolean }>(
        "SELECT true AS healthy;"
      );
      expect(postStressRes.rows[0].healthy).toBe(true);
    });

    it("retains pool health and zero connection leak after rapid rejected mutations", async () => {
      const attempts = 25;

      const rejectionTasks = Array.from({ length: attempts }, async () => {
        try {
          await queryRouter(
            "UPDATE balance_transactions SET amount = 0 WHERE id = 1"
          );
        } catch {
          // Expected client-side rejection
        }
      });

      await Promise.all(rejectionTasks);

      // Verify that pool operates cleanly without resource exhaustion
      const checkRes = await queryRouter<{ ping: string }>(
        "SELECT 'pong' AS ping;"
      );
      expect(checkRes.rows[0].ping).toBe("pong");
    });
  });
});
