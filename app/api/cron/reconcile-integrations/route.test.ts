import { describe, it, expect, mock } from "bun:test";
import { NextRequest } from "next/server";
if (process.env.ALDERA_BACKEND_ROUTE_TEST_ISOLATED === "1") {
  let authorized = false,
    failed = false,
    calls = 0;
  mock.module("@/lib/cron", () => ({
    verifyCronSecret: () => ({ authorized }),
  }));
  mock.module("@/lib/cron-lock", () => ({
    withCronLock: async (_key: string, action: () => Promise<unknown>) => {
      try {
        return { executed: true, result: await action() };
      } catch {
        return { executed: true, error: new Error("test failure") };
      }
    },
  }));
  mock.module("@/lib/invoice-balance-effects", () => ({
    processInvoiceBalanceEffects: async () => {
      calls++;
      if (failed) throw new Error("test failure");
    },
  }));
  mock.module("@/lib/integration-sync", () => ({
    retryIntegrationSettings: async () => {
      calls++;
    },
  }));
  const { GET } = await import("./route");
  describe("Integration reconciliation cron", () => {
    it("authenticates before attempting retries and reports failures honestly", async () => {
      const req = new NextRequest(
        "http://localhost/api/cron/reconcile-integrations"
      );
      expect((await GET(req)).status).toBe(401);
      expect(calls).toBe(0);
      authorized = true;
      expect((await GET(req)).status).toBe(200);
      expect(calls).toBe(2);
      failed = true;
      expect((await GET(req)).status).toBe(503);
    });
  });
} else {
  describe("Isolated route boundary", () => {
    it("runs route mocks without replacing integration dependencies", () => {
      const child = Bun.spawnSync(
        [process.execPath, "test", import.meta.path],
        {
          env: { ...process.env, ALDERA_BACKEND_ROUTE_TEST_ISOLATED: "1" },
          stdout: "pipe",
          stderr: "pipe",
        }
      );
      if (child.exitCode !== 0)
        throw new Error(child.stderr.toString() + child.stdout.toString());
      expect(child.exitCode).toBe(0);
    });
  });
}
