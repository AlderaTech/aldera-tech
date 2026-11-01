import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { verifyTurnstileToken } from "./turnstile";

describe("AT-L13: lib/turnstile.ts (Cloudflare Turnstile Verification)", () => {
  const originalEnv = process.env.TURNSTILE_SECRET_KEY;
  const originalFetch = globalThis.fetch;
  const TEST_SECRET = "0x4AAAAAAtestsecretkey";

  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = TEST_SECRET;
  });

  afterEach(() => {
    process.env.TURNSTILE_SECRET_KEY = originalEnv;
    globalThis.fetch = originalFetch;
  });

  it("bypasses verification when TURNSTILE_SECRET_KEY is not configured", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;

    const res = await verifyTurnstileToken("dummy-token");
    expect(res.success).toBe(true);
  });

  it("returns MISSING_TOKEN error when token is empty or undefined", async () => {
    const res = await verifyTurnstileToken("");
    expect(res.success).toBe(false);
    expect(res.code).toBe("MISSING_TOKEN");
    expect(res.error).toContain("Token verifikasi captcha tidak ditemukan");
  });

  it("returns success: true when Cloudflare API responds with success", async () => {
    globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
      expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
      expect(init?.method).toBe("POST");
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const res = await verifyTurnstileToken("valid-cf-token");
    expect(res.success).toBe(true);
  });

  it("returns VERIFICATION_FAILED error when Cloudflare API reports invalid token", async () => {
    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }) as typeof fetch;

    const res = await verifyTurnstileToken("invalid-cf-token");
    expect(res.success).toBe(false);
    expect(res.code).toBe("VERIFICATION_FAILED");
    expect(res.error).toContain("Verifikasi keamanan Turnstile gagal");
  });

  it("handles HTTP 429 rate limiting from Cloudflare API", async () => {
    globalThis.fetch = (async () => {
      return new Response("Too Many Requests", {
        status: 429,
      });
    }) as typeof fetch;

    const res = await verifyTurnstileToken("rate-limited-token");
    expect(res.success).toBe(false);
    expect(res.status).toBe(429);
    expect(res.code).toBe("RATE_LIMITED");
    expect(res.error).toContain("HTTP 429");
  });

  it("handles HTTP 500 server errors from Cloudflare API", async () => {
    globalThis.fetch = (async () => {
      return new Response("Internal Server Error", {
        status: 500,
      });
    }) as typeof fetch;

    const res = await verifyTurnstileToken("server-error-token");
    expect(res.success).toBe(false);
    expect(res.status).toBe(500);
    expect(res.code).toBe("EXTERNAL_ERROR");
    expect(res.error).toContain("HTTP 500");
  });

  it("handles network timeout / AbortError gracefully", async () => {
    globalThis.fetch = (async () => {
      const timeoutError = new Error("The operation was aborted due to timeout");
      timeoutError.name = "TimeoutError";
      throw timeoutError;
    }) as typeof fetch;

    const res = await verifyTurnstileToken("timeout-token");
    expect(res.success).toBe(false);
    expect(res.timeout).toBe(true);
    expect(res.code).toBe("EXTERNAL_TIMEOUT");
    expect(res.error).toContain("timeout");
  });

  it("handles unexpected runtime fetch exceptions gracefully", async () => {
    globalThis.fetch = (async () => {
      throw new Error("DNS resolution failed");
    }) as typeof fetch;

    const res = await verifyTurnstileToken("dns-fail-token");
    expect(res.success).toBe(false);
    expect(res.code).toBe("EXTERNAL_ERROR");
    expect(res.error).toContain("Terjadi kesalahan");
  });
});
