import { createHash, randomInt } from "node:crypto";

/**
 * AI Relay Cryptographic Key Specifications:
 * - Full Key: 'sk-toko-' (8 chars) + 48 alphanumeric chars = 56 characters total.
 * - Key Prefix: first 16 characters ('sk-toko-' + 8 alphanumeric chars).
 * - Key Hash: SHA-256 lowercase hexadecimal digest (64 characters).
 */

export const VIRTUAL_KEY_PREFIX = "sk-toko-";
export const VIRTUAL_KEY_LENGTH = 56;
export const VIRTUAL_KEY_PREFIX_LENGTH = 16;
export const VIRTUAL_KEY_HASH_LENGTH = 64;

export const API_KEY_REGEX = /^sk-toko-[a-zA-Z0-9]{48}$/;
export const API_KEY_PREFIX_REGEX = /^sk-toko-[a-zA-Z0-9]{8}$/;
export const API_KEY_HASH_REGEX = /^[0-9a-f]{64}$/;

const ALPHANUMERIC_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export interface GeneratedApiKey {
  rawKey: string;
  keyPrefix: string;
  keyHash: string;
}

/**
 * Validates whether the given raw API key strictly matches the 56-character format:
 * 'sk-toko-' followed by 48 alphanumeric characters.
 */
export function validateKeyFormat(rawKey: string | null | undefined): boolean {
  if (!rawKey || typeof rawKey !== "string") {
    return false;
  }
  const trimmed = rawKey.trim();
  if (trimmed.length !== VIRTUAL_KEY_LENGTH) {
    return false;
  }
  return API_KEY_REGEX.test(trimmed);
}

/**
 * Validates whether the given prefix matches the 16-character format:
 * 'sk-toko-' followed by 8 alphanumeric characters.
 */
export function validateKeyPrefix(prefix: string | null | undefined): boolean {
  if (!prefix || typeof prefix !== "string") {
    return false;
  }
  const trimmed = prefix.trim();
  if (trimmed.length !== VIRTUAL_KEY_PREFIX_LENGTH) {
    return false;
  }
  return API_KEY_PREFIX_REGEX.test(trimmed);
}

/**
 * Validates whether the given hash matches a valid SHA-256 lowercase hex string (64 chars).
 */
export function validateKeyHash(hash: string | null | undefined): boolean {
  if (!hash || typeof hash !== "string") {
    return false;
  }
  const trimmed = hash.trim();
  if (trimmed.length !== VIRTUAL_KEY_HASH_LENGTH) {
    return false;
  }
  return API_KEY_HASH_REGEX.test(trimmed);
}

/**
 * Computes the SHA-256 lowercase hexadecimal digest of a raw API key.
 */
export function hashKey(rawKey: string): string {
  if (!rawKey || typeof rawKey !== "string") {
    throw new Error("Cannot hash an invalid or empty API key.");
  }
  const trimmed = rawKey.trim();
  return createHash("sha256")
    .update(trimmed, "utf8")
    .digest("hex")
    .toLowerCase();
}

/**
 * Extracts the first 16 characters (key prefix) from a raw API key.
 * Throws an error if the raw key does not match the valid key format.
 */
export function extractKeyPrefix(rawKey: string): string {
  if (!rawKey || typeof rawKey !== "string") {
    throw new Error("Cannot extract prefix from invalid key.");
  }
  const trimmed = rawKey.trim();
  if (!validateKeyFormat(trimmed)) {
    throw new Error(
      `Invalid key format: expected 56-char key matching ${API_KEY_REGEX.source}`
    );
  }
  const prefix = trimmed.slice(0, VIRTUAL_KEY_PREFIX_LENGTH);
  if (!validateKeyPrefix(prefix)) {
    throw new Error(`Invalid prefix extracted: ${prefix}`);
  }
  return prefix;
}

/**
 * Generates a cryptographically secure random API key following the project specifications:
 * - Raw: 'sk-toko-' + 48 random alphanumeric characters (total 56 characters).
 * - Prefix: first 16 characters.
 * - Hash: SHA-256 lowercase hex digest.
 */
export function generateApiKey(): GeneratedApiKey {
  const charsLength = ALPHANUMERIC_CHARS.length;
  let suffix = "";
  for (let i = 0; i < 48; i++) {
    const idx = randomInt(0, charsLength);
    suffix += ALPHANUMERIC_CHARS[idx];
  }

  const rawKey = `${VIRTUAL_KEY_PREFIX}${suffix}`;
  const keyPrefix = rawKey.slice(0, VIRTUAL_KEY_PREFIX_LENGTH);
  const keyHash = hashKey(rawKey);

  // Invariant verification
  if (rawKey.length !== VIRTUAL_KEY_LENGTH || !API_KEY_REGEX.test(rawKey)) {
    throw new Error("Generated API key violates length or regex format.");
  }
  if (
    keyPrefix.length !== VIRTUAL_KEY_PREFIX_LENGTH ||
    !API_KEY_PREFIX_REGEX.test(keyPrefix)
  ) {
    throw new Error("Generated key prefix violates length or regex format.");
  }
  if (
    keyHash.length !== VIRTUAL_KEY_HASH_LENGTH ||
    !API_KEY_HASH_REGEX.test(keyHash)
  ) {
    throw new Error("Generated key hash violates length or regex format.");
  }

  return {
    rawKey,
    keyPrefix,
    keyHash,
  };
}

/**
 * Returns a masked representation of an API key or prefix suitable for safe UI display.
 * Example: 'sk-toko-Ab12Cd34...'
 */
export function maskApiKey(prefixOrKey: string): string {
  if (!prefixOrKey || typeof prefixOrKey !== "string") {
    return "sk-toko-••••••••••••";
  }
  const trimmed = prefixOrKey.trim();
  if (trimmed.length >= VIRTUAL_KEY_PREFIX_LENGTH) {
    return `${trimmed.slice(0, VIRTUAL_KEY_PREFIX_LENGTH)}...`;
  }
  return `${trimmed}...`;
}
