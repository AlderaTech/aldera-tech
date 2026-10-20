/**
 * Upstream 9router Contract Testing Suite (Action Unit/Contract Level)
 *
 * Verifies syncModelsFromUpstream against the programmable mock upstream server:
 * - 200 OK Normal Diverse Catalog
 * - 401 Unauthorized (missing/invalid token or forced mode)
 * - 404 Not Found
 * - 500 Internal Server Error
 * - Corrupt / Malformed JSON payloads
 * - High Latency / Network Timeout (>3500ms AbortController triggering)
 * - Offline / Connection Refused (ECONNREFUSED)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, mock } from "bun:test";
import {
  startMockUpstream,
  type MockUpstreamServer,
} from "../../../aldera-tech-testing/mocks/upstream_llm";

// Admin Session Context for NextAuth
const currentAuthSession = {
  user: {
    id: "admin_action_contract_user",
    roles: ["ADMIN"],
    role: "ADMIN",
    name: "Action Contract Tester",
    email: "action.contract@aldera.tech",
  },
};

mock.module("@/auth", () => ({
  auth: mock(async () => currentAuthSession),
  handlers: {},
  signIn: mock(),
  signOut: mock(),
}));

mock.module("server-only", () => ({}));
mock.module("next/cache", () => ({
  revalidatePath: mock(() => {}),
  revalidateTag: mock(() => {}),
}));

import { syncModelsFromUpstream } from "@/lib/actions/admin-ai-relay";

describe("Upstream 9router Contract Tests (Action Level)", () => {
  let mockUpstream: MockUpstreamServer;
  let originalBaseUrl: string | undefined;

  beforeAll(async () => {
    mockUpstream = startMockUpstream(0);
    originalBaseUrl = process.env.NINE_ROUTER_BASE_URL;
  });

  afterAll(async () => {
    if (originalBaseUrl !== undefined) {
      process.env.NINE_ROUTER_BASE_URL = originalBaseUrl;
    } else {
      delete process.env.NINE_ROUTER_BASE_URL;
    }

    if (mockUpstream) {
      await mockUpstream.stop();
    }
  });

  beforeEach(() => {
    mockUpstream.reset();
    process.env.NINE_ROUTER_BASE_URL = mockUpstream.url;
  });

  it("200 OK: successfully fetches and diffs diverse model catalog", async () => {
    const result = await syncModelsFromUpstream();

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.upstreamUrl).toBe(`${mockUpstream.url}/v1/models`);
    expect(result.diff).toBeDefined();

    const allModels = [
      ...result.diff.newModels.map((m) => m.id),
      ...result.diff.syncedModels.map((m) => m.id),
    ];
    expect(allModels).toContain("gpt-4o");
    expect(allModels).toContain("deepseek-chat");
    expect(allModels).toContain("claude-3-5-sonnet-20241022");
  });

  it("401 Unauthorized: returns graceful failure response without crashing", async () => {
    mockUpstream.setMode("401");

    const result = await syncModelsFromUpstream();

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(result.error).toMatch(/401|status 401|unauthorized|API key/i);
    expect(result.diff.newModels).toEqual([]);
    expect(result.diff.syncedModels).toEqual([]);
  });

  it("404 Not Found: returns graceful failure response without crashing", async () => {
    mockUpstream.setMode("404");

    const result = await syncModelsFromUpstream();

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(result.error).toMatch(/404|status 404|Not Found/i);
    expect(result.diff.newModels).toEqual([]);
  });

  it("500 Server Error: returns graceful failure response without crashing", async () => {
    mockUpstream.setMode("500");

    const result = await syncModelsFromUpstream();

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(result.error).toMatch(/500|status 500|Internal/i);
    expect(result.diff.newModels).toEqual([]);
  });

  it("Corrupt JSON: handles invalid JSON syntax without unhandled exceptions", async () => {
    mockUpstream.setMode("corrupt_json");

    const result = await syncModelsFromUpstream();

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(result.error).toMatch(/tidak valid|JSON|Parse error|SyntaxError|format list/i);
    expect(result.diff.newModels).toEqual([]);
  });

  it("Malformed Shape: handles response with missing data array gracefully", async () => {
    mockUpstream.setMode("malformed_shape");

    const result = await syncModelsFromUpstream();

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(result.error).toMatch(/tidak valid|format list/i);
    expect(result.diff.newModels).toEqual([]);
  });

  it(
    "Timeout (>3500ms): AbortController aborts fetch and returns graceful error",
    async () => {
      mockUpstream.setMode("timeout");
      mockUpstream.setLatencyMs(4000);

      const startTime = Date.now();
      const result = await syncModelsFromUpstream();
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(3400);
      expect(duration).toBeLessThan(7000);

      expect(result.success).toBe(false);
      expect(typeof result.error).toBe("string");
      expect(result.error).toMatch(/abort|timeout|terhubung/i);
      expect(result.diff.newModels).toEqual([]);
    },
    10000
  );

  it("Offline Upstream: handles unreachable port gracefully", async () => {
    process.env.NINE_ROUTER_BASE_URL = "http://127.0.0.1:39997";

    const result = await syncModelsFromUpstream();

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(result.error).toMatch(/gagal|connect|refused|ECONNREFUSED/i);
    expect(result.diff.newModels).toEqual([]);
  });
});
