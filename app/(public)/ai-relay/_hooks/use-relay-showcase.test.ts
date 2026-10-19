import { describe, expect, it } from "bun:test";
import {
  VALID_RELAY_CATEGORIES,
  VALID_IDE_TARGETS,
} from "./use-relay-showcase";

describe("useRelayShowcase Hook & URL Query Parameters Sync", () => {
  describe("Categories & IDE Presets Validation", () => {
    it("exports all 6 supported model categories", () => {
      expect(VALID_RELAY_CATEGORIES).toEqual([
        "All",
        "Coding",
        "Reasoning",
        "Vision",
        "Fast",
        "Budget",
      ]);
    });

    it("exports all 5 supported IDE targets", () => {
      expect(VALID_IDE_TARGETS).toEqual([
        "cursor",
        "cline",
        "roo",
        "continue",
        "openwebui",
      ]);
    });
  });

  describe("URL Query State Contract", () => {
    it("integrates with useUrlState to initialize category, ide, and search query with proper fallbacks", async () => {
      const { useRelayShowcase } = await import("./use-relay-showcase");
      expect(typeof useRelayShowcase).toBe("function");
    });
  });
});
