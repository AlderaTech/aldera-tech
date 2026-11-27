import { describe, expect, it } from "bun:test";
import { ADMIN_EMPTY_CONTEXTS } from "./admin-empty-contexts";

describe("Konten kondisi kosong Admin", () => {
  it("menyediakan label kapital, judul ringkas dan penjelasan pada setiap konteks", () => {
    for (const context of Object.values(ADMIN_EMPTY_CONTEXTS)) {
      expect(context.label).toBe(context.label.toUpperCase());
      expect(context.title.length).toBeGreaterThan(0);
      expect(context.title.length).toBeLessThan(65);
      expect(context.description.length).toBeGreaterThan(0);
    }
  });
  it("tidak menyatakan pembayaran atau pemeriksaan berhasil saat data kosong", () => {
    expect(ADMIN_EMPTY_CONTEXTS.topups.description).not.toContain(
      "telah diproses"
    );
    expect(ADMIN_EMPTY_CONTEXTS.invoices.description).not.toContain("lunas");
    expect(ADMIN_EMPTY_CONTEXTS.ledger.description).not.toContain("PASS");
  });
});
