"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  retryInvoiceReconciliation,
  restoreReviewedAiAccess,
} from "@/lib/actions/invoice-reconciliation";
import { formatCurrency } from "@/lib/utils";

export type ReconciliationRow = {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  amount: string;
  kind: string;
  status: string;
  message: string | null;
};
export function InvoiceReconciliation({ rows }: { rows: ReconciliationRow[] }) {
  const [pending, start] = useTransition();
  if (!rows.length) return null;
  function run(action: () => Promise<unknown>) {
    start(async () => {
      try {
        await action();
        toast.success("Status rekonsiliasi diperbarui.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Rekonsiliasi gagal."
        );
      }
    });
  }
  return (
    <section
      className="space-y-3 rounded-2xl border bg-card p-5"
      aria-label="Tinjauan refund dan saldo"
    >
      <h2 className="font-semibold">Tinjauan refund & saldo AI</h2>
      <p className="text-sm text-muted-foreground">
        Saldo tidak cukup saat refund memblokir akses AI. Periksa ledger, lalu
        coba rekonsiliasi kembali. Akses hanya dapat dibuka setelah refund
        selesai.
      </p>
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex flex-wrap items-center justify-between gap-3 border-t pt-3"
        >
          <div className="text-sm">
            <strong>
              {row.number} · {row.clientName}
            </strong>
            <p>
              {row.kind === "REFUND" ? "Pengembalian dana" : "Kredit saldo"} ·{" "}
              {formatCurrency(Number(row.amount))} ·{" "}
              {row.status === "REVIEW"
                ? "Perlu tinjauan"
                : row.status === "APPLIED"
                  ? "Terekonsiliasi"
                  : "Tertunda"}
            </p>
            <p role="status">{row.message}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={pending || row.status === "APPLIED"}
              onClick={() => run(() => retryInvoiceReconciliation(row.id))}
            >
              Coba rekonsiliasi
            </Button>
            <Button
              variant="outline"
              disabled={pending || row.status !== "APPLIED"}
              onClick={() => run(() => restoreReviewedAiAccess(row.clientId))}
            >
              Buka akses AI
            </Button>
          </div>
        </div>
      ))}
    </section>
  );
}
