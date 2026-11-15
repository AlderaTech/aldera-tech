import { describe, it, expect, mock } from "bun:test";
import { requestRelayCompletion } from "./relay-upstream";
describe("Real AI completion contract", () => {
  it("forwards configured authorization and requires real usage/content", async () => {
    const saved = globalThis.fetch,
      key = process.env.NINE_ROUTER_API_KEY;
    let authorization: string | null = null;
    process.env.NINE_ROUTER_API_KEY = "test-local-upstream-key";
    globalThis.fetch = mock(async (_url: unknown, options?: RequestInit) => {
      authorization = new Headers(options?.headers).get("Authorization");
      return Response.json({
        choices: [{ message: { content: "Actual fixture" } }],
        usage: { prompt_tokens: 123, completion_tokens: 45 },
      });
    }) as typeof fetch;
    try {
      const result = await requestRelayCompletion("fixture-model", "Hello");
      expect(result).toMatchObject({
        content: "Actual fixture",
        promptTokens: 123,
        completionTokens: 45,
      });
      expect(authorization).toBe("Bearer test-local-upstream-key");
    } finally {
      globalThis.fetch = saved;
      if (key === undefined) delete process.env.NINE_ROUTER_API_KEY;
      else process.env.NINE_ROUTER_API_KEY = key;
    }
  });
  it("rejects errors, malformed usage and missing assistant text instead of fabricating a completion", async () => {
    const saved = globalThis.fetch;
    try {
      for (const response of [
        new Response("down", { status: 500 }),
        Response.json({
          choices: [],
          usage: { prompt_tokens: 1, completion_tokens: 1 },
        }),
        Response.json({
          choices: [{ message: { content: "hi" } }],
          usage: { prompt_tokens: -1, completion_tokens: 1 },
        }),
      ]) {
        globalThis.fetch = mock(async () => response) as typeof fetch;
        await expect(
          requestRelayCompletion("fixture-model", "Hello")
        ).rejects.toThrow("Saldo tidak dipotong");
      }
    } finally {
      globalThis.fetch = saved;
    }
  });
});
