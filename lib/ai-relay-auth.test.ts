import { describe, it, expect } from "bun:test";
import {
  generateApiKey,
  validateKeyFormat,
  validateKeyPrefix,
  validateKeyHash,
  extractKeyPrefix,
  hashKey,
  maskApiKey,
  VIRTUAL_KEY_PREFIX,
  VIRTUAL_KEY_LENGTH,
  VIRTUAL_KEY_PREFIX_LENGTH,
  VIRTUAL_KEY_HASH_LENGTH,
  API_KEY_REGEX,
  API_KEY_PREFIX_REGEX,
  API_KEY_HASH_REGEX,
} from "./ai-relay-auth";

describe("AI Relay Cryptographic Auth Utilities", () => {
  describe("Key Generation", () => {
    it("generates a valid 56-character API key matching format", () => {
      const { rawKey, keyPrefix, keyHash } = generateApiKey();

      // Check lengths
      expect(rawKey.length).toBe(VIRTUAL_KEY_LENGTH);
      expect(keyPrefix.length).toBe(VIRTUAL_KEY_PREFIX_LENGTH);
      expect(keyHash.length).toBe(VIRTUAL_KEY_HASH_LENGTH);

      // Check prefixes and regexes
      expect(rawKey.startsWith(VIRTUAL_KEY_PREFIX)).toBe(true);
      expect(API_KEY_REGEX.test(rawKey)).toBe(true);
      expect(API_KEY_PREFIX_REGEX.test(keyPrefix)).toBe(true);
      expect(API_KEY_HASH_REGEX.test(keyHash)).toBe(true);

      // Prefix matches first 16 chars of raw key
      expect(keyPrefix).toBe(rawKey.slice(0, 16));

      // Hash matches SHA-256 of raw key
      expect(keyHash).toBe(hashKey(rawKey));
    });

    it("generates unique keys across multiple invocations", () => {
      const keys = new Set<string>();
      const hashes = new Set<string>();

      for (let i = 0; i < 50; i++) {
        const { rawKey, keyHash } = generateApiKey();
        expect(keys.has(rawKey)).toBe(false);
        expect(hashes.has(keyHash)).toBe(false);
        keys.add(rawKey);
        hashes.add(keyHash);
      }

      expect(keys.size).toBe(50);
      expect(hashes.size).toBe(50);
    });
  });

  describe("Validation Functions", () => {
    it("validates correct raw key format", () => {
      const validKey = "sk-toko-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL";
      expect(validKey.length).toBe(56);
      expect(validateKeyFormat(validKey)).toBe(true);
    });

    it("rejects invalid raw key formats", () => {
      // Wrong prefix
      expect(
        validateKeyFormat(
          "sk-live-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL"
        )
      ).toBe(false);

      // Too short
      expect(validateKeyFormat("sk-toko-short")).toBe(false);

      // Too long (57 chars)
      expect(
        validateKeyFormat(
          "sk-toko-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLM"
        )
      ).toBe(false);

      // Invalid characters (dashes or symbols in suffix)
      expect(
        validateKeyFormat(
          "sk-toko-1234-67890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL"
        )
      ).toBe(false);
      expect(
        validateKeyFormat(
          "sk-toko-1234_67890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL"
        )
      ).toBe(false);

      // Null / undefined / empty
      expect(validateKeyFormat(null)).toBe(false);
      expect(validateKeyFormat(undefined)).toBe(false);
      expect(validateKeyFormat("")).toBe(false);
      expect(validateKeyFormat("   ")).toBe(false);
    });

    it("validates key prefix format", () => {
      expect(validateKeyPrefix("sk-toko-12345678")).toBe(true);
      expect(validateKeyPrefix("sk-toko-ABCDEFGH")).toBe(true);

      // Too short
      expect(validateKeyPrefix("sk-toko-1234567")).toBe(false);
      // Too long
      expect(validateKeyPrefix("sk-toko-123456789")).toBe(false);
      // Non-alphanumeric in suffix
      expect(validateKeyPrefix("sk-toko-1234567_")).toBe(false);
      // Wrong prefix
      expect(validateKeyPrefix("sk-test-12345678")).toBe(false);
      // Empty / null
      expect(validateKeyPrefix(null)).toBe(false);
      expect(validateKeyPrefix(undefined)).toBe(false);
    });

    it("validates key hash format", () => {
      const validHash =
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      expect(validHash.length).toBe(64);
      expect(validateKeyHash(validHash)).toBe(true);

      // Uppercase is invalid (must be lowercase hex)
      expect(validateKeyHash(validHash.toUpperCase())).toBe(false);
      // Non-hex characters
      expect(
        validateKeyHash(
          "z3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        )
      ).toBe(false);
      // Wrong length
      expect(validateKeyHash(validHash.slice(0, 63))).toBe(false);
      // Null / empty
      expect(validateKeyHash(null)).toBe(false);
    });
  });

  describe("Hashing & Prefix Extraction", () => {
    it("computes deterministic SHA-256 lowercase hex hashes", () => {
      const testKey =
        "sk-toko-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
      const hash1 = hashKey(testKey);
      const hash2 = hashKey(testKey);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
      expect(/^[0-9a-f]{64}$/.test(hash1)).toBe(true);
    });

    it("throws on invalid hash inputs", () => {
      expect(() => hashKey("")).toThrow();
      // @ts-expect-error Testing invalid runtime input
      expect(() => hashKey(null)).toThrow();
    });

    it("extracts valid prefix from raw key", () => {
      const testKey =
        "sk-toko-ABC1234567890abcdefghijklmnopqrstuvwxyz123456789";
      const prefix = extractKeyPrefix(testKey);
      expect(prefix).toBe("sk-toko-ABC12345");
      expect(prefix.length).toBe(16);
    });

    it("throws when extracting prefix from malformed key", () => {
      expect(() => extractKeyPrefix("sk-toko-short")).toThrow();
      expect(() => extractKeyPrefix("sk-wrong-123456789012345678901234567890123456789012345678")).toThrow();
    });
  });

  describe("Masking", () => {
    it("masks key properly for safe presentation", () => {
      const testKey =
        "sk-toko-ABC1234567890abcdefghijklmnopqrstuvwxyz123456789";
      const masked = maskApiKey(testKey);
      expect(masked).toBe("sk-toko-ABC12345...");
    });

    it("handles null / empty safely in masking", () => {
      expect(maskApiKey("")).toContain("sk-toko-");
      // @ts-expect-error Testing invalid runtime input
      expect(maskApiKey(null)).toContain("sk-toko-");
    });
  });
});
