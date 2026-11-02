const ledgerCheckLabels: Record<string, string> = {
  ROW_ARITHMETIC_INVARIANT: "Kesesuaian perhitungan transaksi",
  LIFETIME_SUM_INVARIANT: "Kesesuaian akumulasi saldo",
  TRANSACTION_POLARITY_INVARIANT: "Kesesuaian arah transaksi",
  USAGE_LOG_RECONCILIATION: "Rekonsiliasi catatan pemakaian",
  TOPUP_REQUEST_RECONCILIATION: "Rekonsiliasi permintaan top-up",
};

/** Label presentasi; ID pemeriksaan dari database tetap dipakai sebagai key. */
export function getLedgerCheckLabel(checkName: string): string {
  const normalized = checkName.trim();
  const label = ledgerCheckLabels[normalized.toUpperCase()];
  if (label) return label;
  const words = normalized
    .replace(/_+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
  return words
    ? words[0].toUpperCase() + words.slice(1)
    : "Pemeriksaan integritas";
}
