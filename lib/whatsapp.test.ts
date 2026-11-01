import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { normalizePhone, sendWhatsApp } from "./whatsapp";

describe("lib/whatsapp.ts unit test suite", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("normalizePhone() helper", () => {
    it("converts Indonesian local 08 prefix to international 62", () => {
      expect(normalizePhone("081234567890")).toBe("6281234567890");
      expect(normalizePhone("085711223344")).toBe("6285711223344");
    });

    it("preserves already international 62 prefix", () => {
      expect(normalizePhone("6281234567890")).toBe("6281234567890");
    });

    it("strips plus signs, spaces, parentheses, and dashes", () => {
      expect(normalizePhone("+62 812-3456-7890")).toBe("6281234567890");
      expect(normalizePhone("(0812) 3456-7890")).toBe("6281234567890");
    });

    it("returns null for phone numbers with fewer than 9 digits", () => {
      expect(normalizePhone("081234")).toBeNull();
      expect(normalizePhone("12345")).toBeNull();
    });

    it("returns null for non-numeric or empty strings", () => {
      expect(normalizePhone("")).toBeNull();
      expect(normalizePhone("not-a-phone-number")).toBeNull();
    });
  });

  describe("sendWhatsApp() function", () => {
    it("rejects invalid phone numbers immediately without network call", async () => {
      const result = await sendWhatsApp({
        to: "123",
        message: "Hello",
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid phone number");
    });

    it("falls back to simulated mode when WHATSAPP_API_KEY is not configured", async () => {
      delete process.env.WHATSAPP_API_KEY;

      const result = await sendWhatsApp({
        to: "081234567890",
        message: "Simulated message",
      });

      expect(result.success).toBe(true);
      expect(result.simulated).toBe(true);
    });

    it("dispatches successful POST request when API key is configured", async () => {
      process.env.WHATSAPP_API_KEY = "test-fonnte-key";
      process.env.WHATSAPP_API_URL = "https://mock.fonnte.local/send";

      const originalFetch = globalThis.fetch;
      let capturedPayload: unknown = null;
      let capturedHeaders: HeadersInit | undefined;

      globalThis.fetch = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
        capturedPayload = JSON.parse(init?.body as string);
        capturedHeaders = init?.headers;
        return new Response(JSON.stringify({ status: true }), { status: 200 });
      }) as unknown as typeof fetch;

      try {
        const result = await sendWhatsApp({
          to: "081234567890",
          message: "Hello Aldera Client!",
        });

        expect(result.success).toBe(true);
        expect(capturedPayload).toEqual({
          target: "6281234567890",
          message: "Hello Aldera Client!",
        });
        expect((capturedHeaders as Record<string, string>)["Authorization"]).toBe(
          "test-fonnte-key"
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("handles HTTP 429 Rate Limit error gracefully", async () => {
      process.env.WHATSAPP_API_KEY = "test-fonnte-key";
      process.env.WHATSAPP_API_URL = "https://mock.fonnte.local/send";

      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(async () => {
        return new Response("Too Many Requests", { status: 429 });
      }) as unknown as typeof fetch;

      try {
        const result = await sendWhatsApp({
          to: "081234567890",
          message: "Rapid burst",
        });

        expect(result.success).toBe(false);
        expect(result.status).toBe(429);
        expect(result.code).toBe("RATE_LIMITED");
        expect(result.error).toContain("Rate limit exceeded");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("handles Abort / Timeout errors cleanly with EXTERNAL_TIMEOUT code", async () => {
      process.env.WHATSAPP_API_KEY = "test-fonnte-key";
      process.env.WHATSAPP_API_URL = "https://mock.fonnte.local/send";

      const originalFetch = globalThis.fetch;
      globalThis.fetch = mock(async () => {
        const abortErr = new Error("The operation was aborted");
        abortErr.name = "AbortError";
        throw abortErr;
      }) as unknown as typeof fetch;

      try {
        const result = await sendWhatsApp({
          to: "081234567890",
          message: "Timeout message",
        });

        expect(result.success).toBe(false);
        expect(result.timeout).toBe(true);
        expect(result.code).toBe("EXTERNAL_TIMEOUT");
        expect(result.error).toContain("WhatsApp service timeout");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
