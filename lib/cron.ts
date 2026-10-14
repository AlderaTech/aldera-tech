import { createHash, timingSafeEqual } from "crypto";

export interface CronAuthResult {
  authorized: boolean;
  error?: string;
}

/**
 * Validates that an incoming cron HTTP request provides a valid Authorization Bearer token
 * matching process.env.CRON_SECRET.
 *
 * Uses SHA-256 digest hashing followed by crypto.timingSafeEqual to prevent timing attacks
 * while avoiding buffer length mismatch RangeErrors.
 */
export function verifyCronSecret(request: Request): CronAuthResult {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return {
      authorized: false,
      error: "Cron secret is not configured on server",
    };
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;

  // Hash both buffers to fixed 32-byte digests to guarantee constant-time comparison
  const authHash = createHash("sha256").update(authHeader).digest();
  const expectedHash = createHash("sha256").update(expected).digest();

  if (!timingSafeEqual(authHash, expectedHash)) {
    return {
      authorized: false,
      error: "Unauthorized",
    };
  }

  return { authorized: true };
}
