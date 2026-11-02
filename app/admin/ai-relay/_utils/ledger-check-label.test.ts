import { describe, expect, it } from "bun:test";
import { getLedgerCheckLabel } from "./ledger-check-label";
describe("Nama pemeriksaan ledger", () => {
  const labels = {
    ROW_ARITHMETIC_INVARIANT: "Kesesuaian perhitungan transaksi",
    LIFETIME_SUM_INVARIANT: "Kesesuaian akumulasi saldo",
    TRANSACTION_POLARITY_INVARIANT: "Kesesuaian arah transaksi",
    USAGE_LOG_RECONCILIATION: "Rekonsiliasi catatan pemakaian",
    TOPUP_REQUEST_RECONCILIATION: "Rekonsiliasi permintaan top-up",
  };
  it("menampilkan kelima label tanpa mengubah ID sumber", () => {
    for (const [id, label] of Object.entries(labels)) {
      expect(getLedgerCheckLabel(id)).toBe(label);
      expect(getLedgerCheckLabel(id.toLowerCase())).toBe(label);
      expect(getLedgerCheckLabel(id)).not.toContain("_");
      expect(id).toContain("_");
    }
  });
  it("menangani pemeriksaan baru dan nilai kosong sebagai teks presentasi", () => {
    expect(getLedgerCheckLabel("NEW_AUDIT_CHECK")).toBe("New audit check");
    expect(getLedgerCheckLabel("")).toBe("Pemeriksaan integritas");
  });
});
