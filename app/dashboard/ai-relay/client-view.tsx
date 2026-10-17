"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  Bot,
  Calculator,
  Cpu,
  CreditCard,
  Key,
  Layers,
  Terminal,
  Wallet,
  Send,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { formatCurrency } from "@/lib/utils";

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
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(tabFromQuery || "catalog");
  const [prevTabQuery, setPrevTabQuery] = useState(tabFromQuery);

  if (tabFromQuery !== prevTabQuery) {
    setPrevTabQuery(tabFromQuery);
    if (tabFromQuery) {
      setActiveTab(tabFromQuery);
    }
  }

  const [currentBalance, setCurrentBalance] = useState<number>(initialBalance);
  const [selectedPlaygroundModel, setSelectedPlaygroundModel] = useState<
    string | null
  >(null);

  const handleSelectPlaygroundModel = (modelId?: string) => {
    if (modelId) {
      setSelectedPlaygroundModel(modelId);
    }
    setActiveTab("playground");
  };

  const playgroundModels = useMemo(() => {
    if (!selectedPlaygroundModel) return catalog;
    const target = catalog.find((m) => m.id === selectedPlaygroundModel);
    if (!target) return catalog;
    return [
      target,
      ...catalog
        .filter((m) => m.id !== selectedPlaygroundModel)
        .map((m) =>
          m.id === "gpt-4o-mini" && selectedPlaygroundModel !== "gpt-4o-mini"
            ? { ...m, isActive: false }
            : m
        ),
    ];
  }, [catalog, selectedPlaygroundModel]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-xs">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Aldera AI API Relay
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Akses model LLM global (Claude 3.5, GPT-4o, DeepSeek V3/R1)
                dengan pembayaran Rupiah dan integrasi IDE instan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="rounded-xl border bg-white px-3.5 py-1.5 shadow-2xs">
            <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Saldo Aktif
            </span>
            <span className="font-mono text-base font-extrabold text-slate-900">
              {formatCurrency(currentBalance)}
            </span>
          </div>
          <Button
            onClick={() => setActiveTab("billing")}
            className="h-9 bg-emerald-600 text-xs text-white shadow-xs hover:bg-emerald-700"
          >
            <Wallet className="mr-1.5 h-3.5 w-3.5" />
            Top-up Saldo
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="flex h-10 w-full flex-wrap bg-slate-100 p-1 sm:w-auto">
          <TabsTrigger
            value="catalog"
            className="gap-1.5 px-3.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <Layers className="h-3.5 w-3.5" />
            Katalog Model
          </TabsTrigger>
          <TabsTrigger
            value="playground"
            className="gap-1.5 px-3.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <Terminal className="h-3.5 w-3.5" />
            Playground Chat
          </TabsTrigger>
          <TabsTrigger
            value="keys"
            className="gap-1.5 px-3.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <Key className="h-3.5 w-3.5" />
            API Keys
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="gap-1.5 px-3.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Saldo & Ledger
          </TabsTrigger>
          <TabsTrigger
            value="telegram"
            className="gap-1.5 px-3.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <Send className="h-3.5 w-3.5" />
            Telegram Bot
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="gap-1.5 px-3.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <Activity className="h-3.5 w-3.5" />
            Analitik & Log
          </TabsTrigger>
          <TabsTrigger
            value="simulator"
            className="gap-1.5 px-3.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <Calculator className="h-3.5 w-3.5" />
            Komparasi & Simulasi
          </TabsTrigger>
          <TabsTrigger
            value="health"
            className="gap-1.5 px-3.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <Cpu className="h-3.5 w-3.5" />
            Status & Latensi
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Model Catalog */}
        <TabsContent value="catalog" className="space-y-6 outline-hidden">
          <ModelCatalog
            catalog={catalog}
            apiKeys={initialKeys}
            onSelectPlaygroundModel={handleSelectPlaygroundModel}
          />
        </TabsContent>

        {/* Tab 2: Playground */}
        <TabsContent value="playground" className="space-y-6 outline-hidden">
          <AiPlayground
            key={selectedPlaygroundModel || "default"}
            models={playgroundModels}
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
          <ModelHealthMonitor healthMetrics={healthMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AiRelayClientView(props: ClientViewProps) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground">
          Memuat AI Relay...
        </div>
      }
    >
      <AiRelayClientViewInner {...props} />
    </Suspense>
  );
}
