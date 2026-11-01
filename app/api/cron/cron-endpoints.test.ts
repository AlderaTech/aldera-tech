import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { NextRequest } from "next/server";

mock.module("server-only", () => ({}));
mock.module("next/cache", () => ({
  revalidatePath: mock(),
  revalidateTag: mock(),
}));

import { getTestPrisma } from "@/lib/test-prisma";
const testPrisma = getTestPrisma();
mock.module("@/lib/prisma", () => ({
  prisma: testPrisma,
  default: testPrisma,
}));

// Mock cron-lock so we can cleanly simulate lock acquisition, concurrency conflict, and error
const mockWithCronLock = mock();
mock.module("@/lib/cron-lock", () => ({
  withCronLock: mockWithCronLock,
}));

// Mock internal runner functions
const mockRunBalanceGuard = mock();
mock.module("@/lib/balance-guard", () => ({
  runBalanceGuard: mockRunBalanceGuard,
}));

const mockIssueDueRecurringInvoices = mock();
mock.module("@/lib/actions/recurring-invoice", () => ({
  issueDueRecurringInvoices: mockIssueDueRecurringInvoices,
}));

describe("AT-L10: Cron Endpoints Test Suite", () => {
  const originalEnv = process.env.CRON_SECRET;
  const TEST_SECRET = "super-secret-cron-token-12345";

  beforeEach(() => {
    process.env.CRON_SECRET = TEST_SECRET;
    mockWithCronLock.mockReset();
    mockRunBalanceGuard.mockReset();
    mockIssueDueRecurringInvoices.mockReset();
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalEnv;
  });

  describe("Authentication & Bearer Token Validation across endpoints", () => {
    it("returns 401 when CRON_SECRET is not configured on server", async () => {
      delete process.env.CRON_SECRET;
      const { GET: balanceGuardGET } = await import("./balance-guard/route");
      const req = new NextRequest("http://localhost:3000/api/cron/balance-guard", {
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });

      const res = await balanceGuardGET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain("not configured");
    });

    it("returns 401 when Authorization header is missing", async () => {
      const { GET: balanceGuardGET } = await import("./balance-guard/route");
      const req = new NextRequest("http://localhost:3000/api/cron/balance-guard");

      const res = await balanceGuardGET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("returns 401 when Bearer token is invalid or mismatched", async () => {
      const { GET: invoiceReminderGET } = await import("./invoice-reminder/route");
      const req = new NextRequest("http://localhost:3000/api/cron/invoice-reminder", {
        headers: { authorization: "Bearer wrong-secret-token" },
      });

      const res = await invoiceReminderGET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("returns 401 when token prefix is not Bearer", async () => {
      const { GET: issueRecurringGET } = await import("./issue-recurring/route");
      const req = new NextRequest("http://localhost:3000/api/cron/issue-recurring", {
        headers: { authorization: `Basic ${TEST_SECRET}` },
      });

      const res = await issueRecurringGET(req);
      expect(res.status).toBe(401);
    });
  });

  describe("balance-guard endpoint (/api/cron/balance-guard)", () => {
    it("executes balance guard and returns success when lock acquired", async () => {
      const { GET } = await import("./balance-guard/route");

      mockWithCronLock.mockImplementation(async <T>(key: string, task: () => Promise<T>) => {
        expect(key).toBe("balance-guard");
        const res = await task();
        return {
          executed: true,
          skipped: false,
          result: res,
        };
      });
      mockRunBalanceGuard.mockResolvedValue({ scanned: 5, alerted: 2 });

      const req = new NextRequest("http://localhost:3000/api/cron/balance-guard", {
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.scanned).toBe(5);
      expect(json.alerted).toBe(2);
    });

    it("returns 200 skipped when job lock is already held", async () => {
      const { GET } = await import("./balance-guard/route");

      mockWithCronLock.mockResolvedValue({
        executed: false,
        skipped: true,
        reason: "Job already running",
      });

      const req = new NextRequest("http://localhost:3000/api/cron/balance-guard", {
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.skipped).toBe(true);
      expect(json.reason).toContain("already running");
    });

    it("returns 500 when lock task execution throws an error", async () => {
      const { GET } = await import("./balance-guard/route");

      mockWithCronLock.mockResolvedValue({
        executed: true,
        skipped: false,
        error: new Error("Telegram API Network Failure"),
      });

      const req = new NextRequest("http://localhost:3000/api/cron/balance-guard", {
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });

      const res = await GET(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("Telegram API Network Failure");
    });
  });

  describe("issue-recurring endpoint (/api/cron/issue-recurring)", () => {
    it("executes recurring invoice issuance when authorized and lock acquired", async () => {
      const { GET } = await import("./issue-recurring/route");

      mockWithCronLock.mockImplementation(async <T>(key: string, task: () => Promise<T>) => {
        expect(key).toBe("issue-recurring");
        const res = await task();
        return {
          executed: true,
          skipped: false,
          result: res,
        };
      });
      mockIssueDueRecurringInvoices.mockResolvedValue({ created: 3, errors: [] });

      const req = new NextRequest("http://localhost:3000/api/cron/issue-recurring", {
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.created).toBe(3);
      expect(json.timestamp).toBeDefined();
    });
  });

  describe("publish-scheduled endpoint (/api/cron/publish-scheduled)", () => {
    it("executes publish scheduled task when lock acquired", async () => {
      const { GET } = await import("./publish-scheduled/route");

      mockWithCronLock.mockImplementation(async <T>(key: string, task: () => Promise<T>) => {
        expect(key).toBe("publish-scheduled");
        const res = await task();
        return {
          executed: true,
          skipped: false,
          result: res,
        };
      });

      const req = new NextRequest("http://localhost:3000/api/cron/publish-scheduled", {
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(typeof json.published).toBe("number");
      expect(json.timestamp).toBeDefined();
    });
  });
});
