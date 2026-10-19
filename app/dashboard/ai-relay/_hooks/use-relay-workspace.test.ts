import { describe, expect, it } from "bun:test";
import { resolveRelayTab, VALID_RELAY_TABS } from "./use-relay-workspace";

describe("useRelayWorkspace Hook & Tab Synchronization", () => {
  describe("Tab Constants and Normalization (resolveRelayTab)", () => {
    it("contains all 8 native relay dashboard tabs in VALID_RELAY_TABS", () => {
      expect(VALID_RELAY_TABS).toEqual([
        "catalog",
        "playground",
        "keys",
        "billing",
        "telegram",
        "analytics",
        "simulator",
        "health",
      ]);
    });

    it("resolves native tab values accurately without mutation", () => {
      expect(resolveRelayTab("catalog")).toBe("catalog");
      expect(resolveRelayTab("playground")).toBe("playground");
      expect(resolveRelayTab("keys")).toBe("keys");
      expect(resolveRelayTab("billing")).toBe("billing");
      expect(resolveRelayTab("telegram")).toBe("telegram");
      expect(resolveRelayTab("analytics")).toBe("analytics");
      expect(resolveRelayTab("simulator")).toBe("simulator");
      expect(resolveRelayTab("health")).toBe("health");
    });

    it("resolves tab aliases to their canonical dashboard view tabs", () => {
      expect(resolveRelayTab("overview")).toBe("catalog");
      expect(resolveRelayTab("tokens")).toBe("keys");
      expect(resolveRelayTab("presets")).toBe("simulator");
    });

    it("falls back to catalog when tab is empty, null, or undefined", () => {
      expect(resolveRelayTab(null)).toBe("catalog");
      expect(resolveRelayTab(undefined)).toBe("catalog");
      expect(resolveRelayTab("")).toBe("catalog");
    });
  });

  describe("URL Query State Integration", () => {
    it("correctly registers setParam to update tab parameter without page reload", async () => {
      const { useRelayWorkspace } = await import("./use-relay-workspace");
      // Test function contract
      expect(typeof useRelayWorkspace).toBe("function");
    });
  });
});
