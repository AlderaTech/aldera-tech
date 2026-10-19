"use client";

import { Suspense } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ApiKeyManager } from "@/components/ai-relay/api-key-manager";
import { BalanceTopupCard } from "@/components/ai-relay/balance-topup-card";
import { UsageAnalyticsCharts } from "@/components/ai-relay/usage-analytics-charts";
import { AiPlayground } from "@/components/ai-relay/ai-playground";
import { ModelCatalog } from "@/components/ai-relay/model-catalog";
import { ModelHealthMonitor } from "@/components/ai-relay/model-health-monitor";
import { CostSimulator } from "@/components/ai-relay/cost-simulator";
import { AccountBindingCard } from "@/components/ai-relay/account-binding-card";
import {
  type ApiKeyRecord,
  type BalanceTransactionRecord,
  type ModelCatalogItem,
  type ModelHealthStatus,
  type UsageAnalyticsSummary,
  type UsageLogRecord,
} from "@/lib/actions/ai-relay";
import { useUrlState } from "@/lib/hooks/use-url-state";
import { useRelayWorkspace } from "./_hooks/use-relay-workspace";
import { RelayHeader } from "./_components/relay-header";
import { RelayTabs } from "./_components/relay-tabs";
import { RelayMascot } from "./_components/relay-mascot";
import { RelayLoading } from "./_components/relay-loading";
import styles from "./_components/relay-workspace.module.css";

interface ClientViewProps {
  initialBalance: number;
  initialTransactions: BalanceTransactionRecord[];
  initialKeys: ApiKeyRecord[];
  initialAnalytics: UsageAnalyticsSummary;
  initialLogs: UsageLogRecord[];
  catalog: ModelCatalogItem[];
  healthMetrics: ModelHealthStatus[];
}

function AiRelayClientViewInner({
  initialBalance,
  initialTransactions,
  initialKeys,
  initialAnalytics,
  initialLogs,
  catalog,
  healthMetrics,
}: ClientViewProps) {
  const { isPending } = useUrlState();
  const {
    activeTab,
    setActiveTab,
    currentBalance,
    setCurrentBalance,
    selectedPlaygroundModel,
    playgroundModels,
    handleSelectPlaygroundModel,
  } = useRelayWorkspace(initialBalance, catalog);

  return (
    <div
      className={styles.workspace}
      data-ai-relay-workspace
      aria-busy={isPending}
    >
      <RelayHeader
        balance={currentBalance}
        onTopup={() => setActiveTab("billing")}
      />

      {/* Main Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <RelayTabs />

        {/* Tab 1: Model Catalog */}
        <TabsContent value="catalog" className="space-y-6 outline-hidden">
          <ModelCatalog
            catalog={catalog}
            ideIllustration={<RelayMascot pose="coding" />}
            apiKeys={initialKeys}
            onSelectPlaygroundModel={handleSelectPlaygroundModel}
          />
        </TabsContent>

        {/* Tab 2: Playground */}
        <TabsContent value="playground" className="space-y-6 outline-hidden">
          <AiPlayground
            key={selectedPlaygroundModel || "default"}
            models={playgroundModels}
            emptyIllustration={<RelayMascot pose="assistant" />}
            userBalance={currentBalance}
            onBalanceChange={setCurrentBalance}
          />
        </TabsContent>

        {/* Tab 3: API Key Manager */}
        <TabsContent value="keys" className="space-y-6 outline-hidden">
          <ApiKeyManager initialKeys={initialKeys} />
        </TabsContent>

        {/* Tab 4: Saldo & Top-up */}
        <TabsContent value="billing" className="space-y-6 outline-hidden">
          <BalanceTopupCard
            initialBalance={currentBalance}
            initialTransactions={initialTransactions}
          />
        </TabsContent>

        {/* Tab: Telegram Bot Integration */}
        <TabsContent value="telegram" className="space-y-6 outline-hidden">
          <AccountBindingCard />
        </TabsContent>

        {/* Tab 5: Analytics */}
        <TabsContent value="analytics" className="space-y-6 outline-hidden">
          <UsageAnalyticsCharts summary={initialAnalytics} logs={initialLogs} />
        </TabsContent>

        {/* Tab 6: Comparison & Simulator */}
        <TabsContent value="simulator" className="space-y-6 outline-hidden">
          <CostSimulator catalog={catalog} />
        </TabsContent>

        {/* Tab 7: Health & Latency */}
        <TabsContent value="health" className="space-y-6 outline-hidden">
          <ModelHealthMonitor healthMetrics={healthMetrics} dashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AiRelayClientView(props: ClientViewProps) {
  return (
    <Suspense fallback={<RelayLoading />}>
      <AiRelayClientViewInner {...props} />
    </Suspense>
  );
}
