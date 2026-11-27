import { prisma } from "@/lib/prisma";
import { InvoiceReconciliation } from "./_components/invoice-reconciliation";
import {
  getModelPricings,
  getFinancialMetrics,
  getPendingTopupRequests,
  runLedgerAudit,
} from "@/lib/actions/admin-ai-relay";
import { AiRelayAdminClientView } from "./client-view";
import { ServiceAvailabilityControl } from "../_components/service-availability-control";

export const metadata = {
  title: "Operasional AI Gateway — Aldera Tech",
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

  const effects = await prisma.invoiceBalanceEffect.findMany({
    where: { OR: [{ status: { not: "APPLIED" } }, { kind: "REFUND" }] },
    include: { invoice: { include: { client: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  return (
    <>
      <InvoiceReconciliation
        rows={effects.map((e) => ({
          id: e.id,
          number: e.invoice.number,
          clientId: e.invoice.clientId,
          clientName: e.invoice.client.name,
          amount: e.amount.toString(),
          kind: e.kind,
          status: e.status,
          message: e.lastError,
        }))}
      />
      <AiRelayAdminClientView
        initialPricing={modelPricings}
        initialMetrics={financialMetrics}
        initialPendingTopups={pendingTopups}
        initialAuditResults={auditResults}
        serviceControl={<ServiceAvailabilityControl service="ai_router" />}
      />
    </>
  );
}
