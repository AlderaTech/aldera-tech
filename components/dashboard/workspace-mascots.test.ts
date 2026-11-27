import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { WORKSPACE_MASCOT_IMAGES } from "./workspace-mascots";

describe("Pose maskot banner", () => {
  it("mengarah ke aset lokal yang ada dan membedakan konteks fitur", () => {
    for (const src of Object.values(WORKSPACE_MASCOT_IMAGES)) {
      expect(src.startsWith("/images/")).toBe(true);
      expect(existsSync(resolve(process.cwd(), "public", src.slice(1)))).toBe(
        true
      );
    }
    expect(
      new Set([
        WORKSPACE_MASCOT_IMAGES.profile,
        WORKSPACE_MASCOT_IMAGES.invoice,
        WORKSPACE_MASCOT_IMAGES.calculator,
        WORKSPACE_MASCOT_IMAGES.orders,
      ]).size
    ).toBe(4);
  });
});
