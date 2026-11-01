import { describe, it, expect } from "bun:test";
import { checkRateLimit } from "./rate-limit";

describe("AT-L12: lib/rate-limit.ts (In-memory Rate Limiter)", () => {
  it("allows initial request and increments count up to limit", () => {
    const key = `user-login-${Date.now()}`;
    const limit = 3;
    const windowSeconds = 10;

    // 1st request -> allowed
    const res1 = checkRateLimit(key, limit, windowSeconds);
    expect(res1.allowed).toBe(true);
    expect(res1.retryAfter).toBeUndefined();

    // 2nd request -> allowed
    const res2 = checkRateLimit(key, limit, windowSeconds);
    expect(res2.allowed).toBe(true);

    // 3rd request -> allowed (reaches limit)
    const res3 = checkRateLimit(key, limit, windowSeconds);
    expect(res3.allowed).toBe(true);

    // 4th request -> blocked
    const res4 = checkRateLimit(key, limit, windowSeconds);
    expect(res4.allowed).toBe(false);
    expect(res4.retryAfter).toBeGreaterThan(0);
    expect(res4.retryAfter).toBeLessThanOrEqual(windowSeconds);
  });

  it("calculates accurate retryAfter in seconds", () => {
    const key = `user-otp-${Date.now()}`;
    const limit = 1;
    const windowSeconds = 60;

    // 1st request succeeds
    checkRateLimit(key, limit, windowSeconds);

    // 2nd request is blocked
    const blocked = checkRateLimit(key, limit, windowSeconds);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThanOrEqual(58);
    expect(blocked.retryAfter).toBeLessThanOrEqual(60);
  });

  it("isolates quotas for different keys independently", () => {
    const keyA = `user-A-${Date.now()}`;
    const keyB = `user-B-${Date.now()}`;
    const limit = 2;
    const windowSeconds = 30;

    // Exhaust key A
    expect(checkRateLimit(keyA, limit, windowSeconds).allowed).toBe(true);
    expect(checkRateLimit(keyA, limit, windowSeconds).allowed).toBe(true);
    expect(checkRateLimit(keyA, limit, windowSeconds).allowed).toBe(false);

    // Key B should remain completely unblocked
    expect(checkRateLimit(keyB, limit, windowSeconds).allowed).toBe(true);
    expect(checkRateLimit(keyB, limit, windowSeconds).allowed).toBe(true);
    expect(checkRateLimit(keyB, limit, windowSeconds).allowed).toBe(false);
  });

  it("resets limit after the window duration has elapsed", async () => {
    const key = `short-window-${Date.now()}`;
    const limit = 1;
    const windowSeconds = 0.05; // 50 milliseconds

    // 1st request succeeds
    expect(checkRateLimit(key, limit, windowSeconds).allowed).toBe(true);

    // 2nd request blocked immediately
    expect(checkRateLimit(key, limit, windowSeconds).allowed).toBe(false);

    // Wait until window expires
    await new Promise((r) => setTimeout(r, 70));

    // Request should now succeed again
    const refreshed = checkRateLimit(key, limit, windowSeconds);
    expect(refreshed.allowed).toBe(true);
  });
});
