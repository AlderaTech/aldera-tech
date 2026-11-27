import { describe, it, expect } from "bun:test";
import { resolve } from "node:path";
import { getUploadRoot } from "./upload-storage";
describe("Upload storage boundaries", () => {
  it("keeps project and payment documents outside the public volume", () => {
    for (const scope of ["PROJECT", "INVOICE_PROOF", "TOPUP_PROOF"] as const)
      expect(getUploadRoot(scope)).toBe(resolve("storage", "private-uploads"));
    for (const scope of ["PUBLIC_MEDIA", "PRIVATE_LEGACY"] as const)
      expect(getUploadRoot(scope)).toBe(resolve("public", "uploads"));
  });
});
