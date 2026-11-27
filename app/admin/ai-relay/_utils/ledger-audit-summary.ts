import type { LedgerInvariantResult } from "@/lib/router-db";

export function ledgerAuditSummary(results: LedgerInvariantResult[]) {
  if (!results.length)
    return {
      type: "info" as const,
      message: "Pemeriksaan belum menghasilkan data. Coba jalankan kembali.",
    };
  const failed = results.filter((result) => result.status !== "PASS").length;
  return failed
    ? {
        type: "error" as const,
        message: `Pemeriksaan menemukan ${failed} dari ${results.length} aturan yang belum lulus.`,
      }
    : {
        type: "success" as const,
        message: `Pemeriksaan selesai: ${results.length} aturan integritas lulus.`,
      };
}
