import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { getServiceAvailability } from "@/lib/service-availability";
import {
  getUserBalance,
  getBalanceTransactions,
  listApiKeys,
  getUsageAnalytics,
  getUsageLogs,
  getModelCatalog,
  getModelHealthMetrics,
} from "@/lib/actions/ai-relay";
import { AiRelayClientView } from "./client-view";

export const metadata = {
  title: "AI Relay Portal — Dashboard Aldera Tech",
  description:
    "Portal manajemen API Key, saldo Rupiah, analitik token, dan testing prompt AI Relay.",
};

export default async function AiRelayDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(AUTH_ROUTES.loginWithCallback(DASHBOARD_ROUTES.aiRelay));
  }

  const [
    balanceData,
    transactions,
    apiKeys,
    analytics,
    usageLogs,
    catalog,
    healthMetrics,
    routerEnabled,
  ] = await Promise.all([
    getUserBalance(),
    getBalanceTransactions(50),
    listApiKeys(),
    getUsageAnalytics(),
    getUsageLogs(100),
    getModelCatalog(),
    getModelHealthMetrics(),
    getServiceAvailability("ai_router"),
  ]);

  return (
    <AiRelayClientView
      initialBalance={balanceData.balance}
      initialTransactions={transactions}
      initialKeys={apiKeys}
      initialAnalytics={analytics}
      initialLogs={usageLogs}
      catalog={catalog}
      healthMetrics={healthMetrics}
      routerEnabled={routerEnabled}
    />
  );
}
