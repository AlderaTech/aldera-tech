"use client";
import { AdminBanner } from "@/app/admin/_components/admin-banner";
import {
  WorkspaceTabsList as TabsList,
  WorkspaceTabsTrigger as TabsTrigger,
} from "@/components/dashboard/workspace-segmented-tabs";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import {
  AlertCircle,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  DollarSign,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import { AdminMascot } from "../_components/admin-mascot";
import { AdminRelayApproveTopupDialog } from "./_components/admin-relay-approve-topup-dialog";
import { AdminRelayAuditTab } from "./_components/admin-relay-audit-tab";
import { AdminRelayCreateModelDialog } from "./_components/admin-relay-create-model-dialog";
import { AdminRelayEditModelDialog } from "./_components/admin-relay-edit-model-dialog";
import { AdminRelayOverviewTab } from "./_components/admin-relay-overview-tab";
import { AdminRelayPaymentProofDialog } from "./_components/admin-relay-payment-proof-dialog";
import { AdminRelayPricingTab } from "./_components/admin-relay-pricing-tab";
import { AdminRelayRejectTopupDialog } from "./_components/admin-relay-reject-topup-dialog";
import { AdminRelaySyncTab } from "./_components/admin-relay-sync-tab";
import { AdminRelayTopupTab } from "./_components/admin-relay-topup-tab";
import {
  useAdminAiRelay,
  type AdminClientViewProps,
} from "./_hooks/use-admin-ai-relay";
export type { AdminClientViewProps } from "./_hooks/use-admin-ai-relay";
export function AiRelayAdminClientView(props: AdminClientViewProps) {
  const state = useAdminAiRelay(props);
  const {
    activeTab,
    setActiveTab,
    tabRef,
    pricingList,
    isSyncing,
    syncResult,
    pendingTopups,
    auditResults,
    isAuditing,
    notification,
    setNotification,
    handleSync9router,
    handleRunAudit,
    allInvariantsPass,
  } = state;
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <AdminBanner
        data-admin-page-header
        className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between"
        category="ai"
        mascot={<AdminMascot pose="relay" size="header" />}
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <div className="min-w-0 space-y-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Operasional AI Gateway
              </h1>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Kelola harga model, sinkronisasi 9router, antrean pengisian saldo,
              dan pemeriksaan integritas buku besar.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="h-9 text-xs"
          >
            <ShieldCheck
              className={`mr-1.5 h-4 w-4 ${
                allInvariantsPass ? "text-emerald-600" : "text-rose-600"
              }`}
            />
            {isAuditing ? "Memeriksa..." : "Audit Ledger"}
          </Button>
          <Button
            size="sm"
            onClick={handleSync9router}
            disabled={isSyncing}
            className="h-9 bg-primary text-xs text-white shadow-xs hover:bg-primary/90"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Menghubungi 9router..." : "Sinkronkan 9Router"}
          </Button>
        </div>
      </AdminBanner>

      {/* Global Toast / Notification */}
      {notification && (
        <div
          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-xs font-medium shadow-xs transition-all ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : notification.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            )}
            {notification.type === "error" && (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            {notification.type === "info" && (
              <AlertTriangle className="h-4 w-4 shrink-0 text-blue-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList
          ref={tabRef}
          overflow="scroll"
          aria-label="Fitur Admin AI Relay"
        >
          <TabsTrigger
            value="overview"
            className="rounded-lg px-3 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
            Ringkasan Keuangan
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="rounded-lg px-3 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <DollarSign className="mr-1.5 h-3.5 w-3.5" />
            Manajemen Harga Model ({pricingList.length})
          </TabsTrigger>
          <TabsTrigger
            value="sync"
            className="rounded-lg px-3 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Sinkronisasi 9router
            {syncResult?.success && syncResult?.diff?.newModels?.length ? (
              <span className="py-0.2 ml-1.5 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                {syncResult.diff.newModels.length} baru
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="topup"
            className="rounded-lg px-3 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            Tiket Top-up
            {pendingTopups.length > 0 && (
              <span className="py-0.2 ml-1.5 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                {pendingTopups.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="rounded-lg px-3 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Audit Ledger
            <span
              className={`py-0.2 ml-1.5 rounded-full px-1.5 text-[10px] font-bold ${
                auditResults.length === 0
                  ? "bg-slate-100 text-slate-600"
                  : allInvariantsPass
                    ? "bg-emerald-500 text-white"
                    : "bg-rose-500 text-white"
              }`}
            >
              {auditResults.length === 0
                ? "Belum ada hasil"
                : allInvariantsPass
                  ? "5 PASS"
                  : "FAIL"}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Ringkasan Keuangan */}
        <AdminRelayOverviewTab state={state} />

        {/* TAB 2: Manajemen Harga Model */}
        <AdminRelayPricingTab state={state} />

        {/* TAB 3: Sinkronisasi 9router */}
        <AdminRelaySyncTab state={state} />

        {/* TAB 4: Tiket Top-up */}
        <AdminRelayTopupTab state={state} />

        {/* TAB 5: Audit Ledger */}
        <AdminRelayAuditTab state={state} />
      </Tabs>

      {/* DIALOG: Tambah Model Baru */}
      <AdminRelayCreateModelDialog state={state} />

      {/* DIALOG: Edit Harga Model */}
      <AdminRelayEditModelDialog state={state} />

      {/* DIALOG: Konfirmasi Approve Top-up */}
      <AdminRelayApproveTopupDialog state={state} />

      {/* DIALOG: Konfirmasi Reject Top-up */}
      <AdminRelayRejectTopupDialog state={state} />

      {/* DIALOG: Lihat Bukti Transfer */}
      <AdminRelayPaymentProofDialog state={state} />
    </div>
  );
}
