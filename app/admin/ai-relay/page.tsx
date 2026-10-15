import {
  getModelPricings,
  getFinancialMetrics,
  getPendingTopupRequests,
  runLedgerAudit,
} from "@/lib/actions/admin-ai-relay";
import { AiRelayAdminClientView } from "./client-view";

export const metadata = {
  title: "AI Operations & Admin Portal — Aldera Tech",
  description:
    "Katalog harga model dinamis, margin upstream, sinkronisasi 9router, approval tiket transfer, dan audit ledger mutasi saldo.",
};

export default async function AdminAiRelayPage() {
  const [modelPricings, financialMetrics, pendingTopups, auditResults] =
    await Promise.all([
      getModelPricings(),
      getFinancialMetrics(),
      getPendingTopupRequests(),
      runLedgerAudit(),
    ]);

  return (
    <AiRelayAdminClientView
      initialPricing={modelPricings}
      initialMetrics={financialMetrics}
      initialPendingTopups={pendingTopups}
      initialAuditResults={auditResults}
    />
  );
}
