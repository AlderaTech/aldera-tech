const ledgerCheckLabels: Record<string, string> = {
  ROW_ARITHMETIC_INVARIANT: "Kesesuaian perhitungan transaksi",
  LIFETIME_SUM_INVARIANT: "Kesesuaian akumulasi saldo",
  TRANSACTION_POLARITY_INVARIANT: "Kesesuaian arah transaksi",
  USAGE_LOG_RECONCILIATION: "Rekonsiliasi catatan pemakaian",
  TOPUP_REQUEST_RECONCILIATION: "Rekonsiliasi permintaan top-up",
};
const ledgerCheckDescriptions: Record<string, string> = {
  ROW_ARITHMETIC_INVARIANT:
    "Memeriksa saldo akhir terhadap saldo awal dan nominal setiap transaksi.",
  LIFETIME_SUM_INVARIANT:
    "Mencocokkan saldo akun dengan jumlah seluruh mutasi pada buku besar.",
  TRANSACTION_POLARITY_INVARIANT:
    "Memeriksa arah debit atau kredit sesuai jenis transaksi.",
  USAGE_LOG_RECONCILIATION:
    "Mencocokkan debit pemakaian dengan total biaya pada log penggunaan.",
  TOPUP_REQUEST_RECONCILIATION:
    "Memeriksa mutasi kredit untuk setiap permintaan top-up yang disetujui.",
};

export function getLedgerCheckDescription(checkName: string): string {
  return (
    ledgerCheckDescriptions[checkName.trim().toUpperCase()] ??
    "Pemeriksaan integritas data keuangan dan catatan pemakaian."
  );
}

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
