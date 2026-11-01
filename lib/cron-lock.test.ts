import { describe, it, expect, afterAll } from "bun:test";
import type { Pool } from "pg";
import { withCronLock, closeCronPool, getCronPool } from "./cron-lock";

describe("AT-L11: lib/cron-lock.ts (PostgreSQL Distributed Advisory Lock)", () => {
  afterAll(async () => {
    await closeCronPool();
  });

  it("successfully acquires lock, executes task, and releases lock", async () => {
    const key = `test-single-exec-${Date.now()}`;
    let executed = false;

    const res = await withCronLock(key, async () => {
      executed = true;
      return "done";
    });

    expect(res.executed).toBe(true);
    expect(res.skipped).toBe(false);
    expect(res.result).toBe("done");
    expect(executed).toBe(true);
  });

  it("suppresses overlapping execution when lock is held by another concurrent job", async () => {
    const key = `test-concurrent-${Date.now()}`;
    let task1StartedResolve: () => void;
    const task1Started = new Promise<void>((r) => {
      task1StartedResolve = r;
    });

    let continueTask1Resolve: () => void;
    const continueTask1 = new Promise<void>((r) => {
      continueTask1Resolve = r;
    });

    // Start long-running job 1
    const job1Promise = withCronLock(key, async () => {
      task1StartedResolve();
      await continueTask1;
      return "job1-done";
    });

    // Wait until job 1 has acquired lock and entered task
    await task1Started;

    // Concurrently try running job 2 with the identical key
    const job2Res = await withCronLock(key, async () => {
      return "job2-should-not-run";
    });

    expect(job2Res.executed).toBe(false);
    expect(job2Res.skipped).toBe(true);
    expect(job2Res.reason).toContain("held by another process");

    // Let job 1 finish
    continueTask1Resolve!();
    const job1Res = await job1Promise;

    expect(job1Res.executed).toBe(true);
    expect(job1Res.result).toBe("job1-done");

    // After job 1 releases lock, a subsequent job 3 with the same key should succeed
    const job3Res = await withCronLock(key, async () => {
      return "job3-succeeded";
    });
    expect(job3Res.executed).toBe(true);
    expect(job3Res.skipped).toBe(false);
    expect(job3Res.result).toBe("job3-succeeded");
  });

  it("allows concurrent executions with different lock keys", async () => {
    const keyA = `test-diff-A-${Date.now()}`;
    const keyB = `test-diff-B-${Date.now()}`;

    let resolveA: () => void;
    const holdA = new Promise<void>((r) => {
      resolveA = r;
    });

    let resolveB: () => void;
    const holdB = new Promise<void>((r) => {
      resolveB = r;
    });

    const promiseA = withCronLock(keyA, async () => {
      await holdA;
      return "result-A";
    });

    const promiseB = withCronLock(keyB, async () => {
      await holdB;
      return "result-B";
    });

    // Release both
    resolveA!();
    resolveB!();

    const [resA, resB] = await Promise.all([promiseA, promiseB]);

    expect(resA.executed).toBe(true);
    expect(resA.result).toBe("result-A");
    expect(resB.executed).toBe(true);
    expect(resB.result).toBe("result-B");
  });

  it("releases advisory lock properly even when task throws an error", async () => {
    const key = `test-error-cleanup-${Date.now()}`;

    const failRes = await withCronLock(key, async () => {
      throw new Error("Task failed unexpectedly");
    });

    expect(failRes.executed).toBe(true);
    expect(failRes.skipped).toBe(false);
    expect(failRes.error?.message).toBe("Task failed unexpectedly");

    // Verify subsequent task with the same key can acquire lock immediately
    const nextRes = await withCronLock(key, async () => {
      return "recovered";
    });

    expect(nextRes.executed).toBe(true);
    expect(nextRes.result).toBe("recovered");
  });

  it("supports rethrowError: true option", async () => {
    const key = `test-rethrow-${Date.now()}`;

    expect(
      withCronLock(key, { rethrowError: true }, async () => {
        throw new Error("Rethrown custom error");
      })
    ).rejects.toThrow("Rethrown custom error");
  });

  it("handles connection error cleanly when pool cannot connect", async () => {
    const fakePool = {
      connect: async () => {
        throw new Error("Connection pool exhausted");
      },
    } as unknown as Pool;

    const res = await withCronLock(
      "test-fake-pool",
      { pool: fakePool },
      async () => "never"
    );

    expect(res.executed).toBe(false);
    expect(res.skipped).toBe(true);
    expect(res.reason).toContain("Database connection unavailable");
  });
});
