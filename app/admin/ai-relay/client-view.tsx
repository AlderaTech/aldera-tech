"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  DollarSign,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  type ModelPricingItem,
  type FinancialMetricsSummary,
  type PendingTopupRequestItem,
  type ModelSyncDiffResult,
  calculateGrossMarginPercentage,
} from "@/lib/ai-relay-utils";
import {
  getModelPricings,
  createModelPricing,
  updateModelPricing,
  toggleModelPricingStatus,
  syncModelsFromUpstream,
  activateNewModelFromUpstream,
  getFinancialMetrics,
  getPendingTopupRequests,
  approveTopupRequest,
  rejectTopupRequest,
  runLedgerAudit,
} from "@/lib/actions/admin-ai-relay";
import type { LedgerInvariantResult } from "@/lib/router-db";

export interface AdminClientViewProps {
  initialPricing: ModelPricingItem[];
  initialMetrics: FinancialMetricsSummary;
  initialPendingTopups: PendingTopupRequestItem[];
  initialAuditResults: LedgerInvariantResult[];
}

export function AiRelayAdminClientView({
  initialPricing,
  initialMetrics,
  initialPendingTopups,
  initialAuditResults,
}: AdminClientViewProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isPending, startTransition] = useTransition();

  // Financial Metrics State
  const [metrics, setMetrics] = useState<FinancialMetricsSummary>(initialMetrics);

  // Model Pricing State (F14)
  const [pricingList, setPricingList] = useState<ModelPricingItem[]>(initialPricing);
  const [modelSearch, setModelSearch] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingModel, setEditingModel] = useState<ModelPricingItem | null>(null);

  // Add Model Form State
  const [newModelName, setNewModelName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newInputPrice, setNewInputPrice] = useState(25000);
  const [newOutputPrice, setNewOutputPrice] = useState(50000);
  const [newUpstreamCost, setNewUpstreamCost] = useState(15000);

  // Edit Model Form State
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editInputPrice, setEditInputPrice] = useState(0);
  const [editOutputPrice, setEditOutputPrice] = useState(0);

  // 9router Sync State (F15)
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    upstreamUrl: string;
    diff: ModelSyncDiffResult;
    error?: string;
  } | null>(null);
  const [activatingModelId, setActivatingModelId] = useState<string | null>(null);

  // Top-up Approval Queue State (F16)
  const [pendingTopups, setPendingTopups] =
    useState<PendingTopupRequestItem[]>(initialPendingTopups);
  const [approvingTicket, setApprovingTicket] =
    useState<PendingTopupRequestItem | null>(null);
  const [rejectingTicket, setRejectingTicket] =
    useState<PendingTopupRequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [viewProofTicket, setViewProofTicket] =
    useState<PendingTopupRequestItem | null>(null);

  // Ledger Invariant Audit State (F16)
  const [auditResults, setAuditResults] =
    useState<LedgerInvariantResult[]>(initialAuditResults);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [lastAuditedAt, setLastAuditedAt] = useState<Date>(new Date());

  // Global notification banner
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  // ==========================================================================
  // F14: Model Pricing Handlers
  // ==========================================================================

  const refreshPricing = async () => {
    const fresh = await getModelPricings();
    setPricingList(fresh);
  };

  const handleToggleStatus = async (item: ModelPricingItem) => {
    const nextStatus = !item.is_active;
    startTransition(async () => {
      try {
        await toggleModelPricingStatus(item.id, nextStatus);
        setPricingList((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, is_active: nextStatus } : p))
        );
        showNotification(
          "success",
          `Model ${item.model_name} berhasil ${nextStatus ? "diaktifkan" : "dinonaktifkan"}.`
        );
      } catch (err) {
        showNotification(
          "error",
          err instanceof Error ? err.message : "Gagal memperbarui status model."
        );
      }
    });
  };

  const handleOpenEdit = (item: ModelPricingItem) => {
    setEditingModel(item);
    setEditDisplayName(item.display_name);
    setEditInputPrice(item.input_price_per_m);
    setEditOutputPrice(item.output_price_per_m);
  };

  const handleSaveEdit = async () => {
    if (!editingModel) return;
    startTransition(async () => {
      try {
        await updateModelPricing(editingModel.id, {
          display_name: editDisplayName,
          input_price_per_m: Number(editInputPrice),
          output_price_per_m: Number(editOutputPrice),
        });
        await refreshPricing();
        setEditingModel(null);
        showNotification(
          "success",
          `Harga model ${editingModel.model_name} berhasil diperbarui.`
        );
      } catch (err) {
        showNotification(
          "error",
          err instanceof Error ? err.message : "Gagal menyimpan perubahan harga."
        );
      }
    });
  };

  const handleCreateModel = async () => {
    if (!newModelName.trim() || !newDisplayName.trim()) {
      showNotification("error", "Model Name dan Display Name wajib diisi.");
      return;
    }
    startTransition(async () => {
      try {
        await createModelPricing({
          model_name: newModelName.trim(),
          display_name: newDisplayName.trim(),
          input_price_per_m: Number(newInputPrice),
          output_price_per_m: Number(newOutputPrice),
          is_active: true,
        });
        await refreshPricing();
        setIsAddModalOpen(false);
        setNewModelName("");
        setNewDisplayName("");
        showNotification(
          "success",
          `Model baru ${newModelName} berhasil ditambahkan ke katalog.`
        );
      } catch (err) {
        showNotification(
          "error",
          err instanceof Error ? err.message : "Gagal menambahkan model."
        );
      }
    });
  };

  const filteredPricing = pricingList.filter((m) => {
    if (!modelSearch.trim()) return true;
    const q = modelSearch.toLowerCase();
    return (
      m.model_name.toLowerCase().includes(q) ||
      m.display_name.toLowerCase().includes(q)
    );
  });

  // ==========================================================================
  // F15: 9router Sync Handlers
  // ==========================================================================

  const handleSync9router = async () => {
    setIsSyncing(true);
    try {
      const res = await syncModelsFromUpstream();
      setSyncResult(res);
      if (res.success) {
        showNotification(
          "success",
          `Sinkronisasi 9router berhasil! Terdeteksi ${res.diff.newModels.length} model baru.`
        );
      } else {
        showNotification("error", res.error || "Gagal menghubungi 9router.");
      }
    } catch (err) {
      showNotification(
        "error",
        err instanceof Error ? err.message : "Gagal melakukan sync."
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleActivateNewModel = async (modelId: string) => {
    setActivatingModelId(modelId);
    startTransition(async () => {
      try {
        await activateNewModelFromUpstream(modelId);
        await refreshPricing();
        if (syncResult) {
          setSyncResult({
            ...syncResult,
            diff: {
              ...syncResult.diff,
              newModels: syncResult.diff.newModels.filter((m) => m.id !== modelId),
              syncedModels: [
                ...syncResult.diff.syncedModels,
                { id: modelId, object: "model" },
              ],
            },
          });
        }
        showNotification(
          "success",
          `Model ${modelId} berhasil diaktifkan dengan 1-click!`
        );
      } catch (err) {
        showNotification(
          "error",
          err instanceof Error ? err.message : "Gagal mengaktifkan model."
        );
      } finally {
        setActivatingModelId(null);
      }
    });
  };

  // ==========================================================================
  // F16: Top-up Approval & Ledger Audit Handlers
  // ==========================================================================

  const refreshFinancialData = async () => {
    const [freshMetrics, freshPending] = await Promise.all([
      getFinancialMetrics(),
      getPendingTopupRequests(),
    ]);
    setMetrics(freshMetrics);
    setPendingTopups(freshPending);
  };

  const handleConfirmApprove = async () => {
    if (!approvingTicket) return;
    const ticketId = approvingTicket.id;
    startTransition(async () => {
      try {
        await approveTopupRequest(ticketId);
        await refreshFinancialData();
        setApprovingTicket(null);
        showNotification(
          "success",
          `Tiket top-up #${ticketId} berhasil disetujui! Saldo user telah ditambahkan.`
        );
      } catch (err) {
        showNotification(
          "error",
          err instanceof Error ? err.message : "Gagal menyetujui tiket top-up."
        );
      }
    });
  };

  const handleConfirmReject = async () => {
    if (!rejectingTicket) return;
    const ticketId = rejectingTicket.id;
    startTransition(async () => {
      try {
        await rejectTopupRequest(ticketId, rejectReason);
        await refreshFinancialData();
        setRejectingTicket(null);
        setRejectReason("");
        showNotification(
          "info",
          `Tiket top-up #${ticketId} berhasil ditandai sebagai ditolak (rejected).`
        );
      } catch (err) {
        showNotification(
          "error",
          err instanceof Error ? err.message : "Gagal menolak tiket top-up."
        );
      }
    });
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const results = await runLedgerAudit();
      setAuditResults(results);
      setLastAuditedAt(new Date());
      const failCount = results.filter((r) => r.status === "FAIL").length;
      if (failCount === 0) {
        showNotification(
          "success",
          "Audit Selesai: Seluruh 5 invarian ledger berstatus PASS 100%!"
        );
      } else {
        showNotification(
          "error",
          `Audit Mendeteksi Masalah: ${failCount} invarian berstatus FAIL!`
        );
      }
    } catch (err) {
      showNotification(
        "error",
        err instanceof Error ? err.message : "Gagal menjalankan audit ledger."
      );
    } finally {
      setIsAuditing(false);
    }
  };

  const allInvariantsPass = auditResults.every((r) => r.status === "PASS");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-900 p-2.5 text-white shadow-xs">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                AI Operations & Admin Portal
              </h1>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100">
                ADMIN ONLY
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kelola dynamic pricing, sinkronisasi model 9router, antrean tiket top-up, dan validasi integritas audit ledger.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="text-xs h-9"
          >
            <ShieldCheck
              className={`h-4 w-4 mr-1.5 ${
                allInvariantsPass ? "text-emerald-600" : "text-rose-600"
              }`}
            />
            {isAuditing ? "Memeriksa..." : "Audit Ledger"}
          </Button>
          <Button
            size="sm"
            onClick={handleSync9router}
            disabled={isSyncing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 shadow-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Menghubungi 9router..." : "Sync 9router"}
          </Button>
        </div>
      </div>

      {/* Global Toast / Notification */}
      {notification && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-lg text-xs font-medium border shadow-xs transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : notification.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-blue-50 text-blue-800 border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" && (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            )}
            {notification.type === "error" && (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            {notification.type === "info" && (
              <AlertTriangle className="h-4 w-4 text-blue-600 shrink-0" />
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl h-auto flex flex-wrap gap-1 border">
          <TabsTrigger
            value="overview"
            className="rounded-lg text-xs font-medium py-2 px-3 data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            Ringkasan Keuangan
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="rounded-lg text-xs font-medium py-2 px-3 data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
            Manajemen Harga Model ({pricingList.length})
          </TabsTrigger>
          <TabsTrigger
            value="sync"
            className="rounded-lg text-xs font-medium py-2 px-3 data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Sinkronisasi 9router
            {syncResult?.diff?.newModels?.length ? (
              <span className="ml-1.5 bg-rose-500 text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                {syncResult.diff.newModels.length} baru
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="topup"
            className="rounded-lg text-xs font-medium py-2 px-3 data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Tiket Top-up
            {pendingTopups.length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                {pendingTopups.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="rounded-lg text-xs font-medium py-2 px-3 data-[state=active]:bg-white data-[state=active]:shadow-2xs"
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
            Audit Ledger
            <span
              className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                allInvariantsPass
                  ? "bg-emerald-500 text-white"
                  : "bg-rose-500 text-white"
              }`}
            >
              {allInvariantsPass ? "5 PASS" : "FAIL"}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Ringkasan Keuangan */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Omzet Top-up
                </CardTitle>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {formatCurrency(metrics.totalOmzet)}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Dari {metrics.approvedCount} tiket top-up disetujui
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Volume Token Terpakai
                </CardTitle>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Cpu className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {metrics.totalTokens.toLocaleString("id-ID")}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Prompt + Completion tokens
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Biaya Pemakaian
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {formatCurrency(metrics.totalUsageCost)}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Pengurangan saldo dari gateway relay
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Net Margin Kas
                </CardTitle>
                <div
                  className={`p-2 rounded-lg ${
                    metrics.netMargin >= 0
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold font-mono ${
                    metrics.netMargin >= 0 ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {formatCurrency(metrics.netMargin)}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Omzet - Biaya terpakai
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Status Antrean Top-up</span>
                  <Badge variant="outline">
                    {metrics.pendingCount} Menunggu
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Ringkasan status permintaan pengisian saldo dari pengguna
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-1.5 border-b text-xs">
                  <span className="text-muted-foreground">Menunggu Persetujuan (Pending)</span>
                  <span className="font-bold text-amber-600">{metrics.pendingCount} tiket</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b text-xs">
                  <span className="text-muted-foreground">Telah Disetujui (Approved)</span>
                  <span className="font-bold text-emerald-600">{metrics.approvedCount} tiket</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-muted-foreground">Telah Ditolak (Rejected)</span>
                  <span className="font-bold text-slate-500">{metrics.rejectedCount} tiket</span>
                </div>

                {metrics.pendingCount > 0 && (
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("topup")}
                    className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  >
                    Buka Antrean Top-up ({metrics.pendingCount})
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Status Integritas Audit Ledger</span>
                  <Badge
                    className={
                      allInvariantsPass
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                    }
                  >
                    {allInvariantsPass ? "SEMUA PASS" : "ADA MASALAH"}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Hasil diagnostik prosedur `verify_ledger_invariants()` PostgreSQL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditResults.map((inv) => (
                  <div
                    key={inv.check_name}
                    className="flex items-center justify-between py-1.5 border-b last:border-0 text-xs"
                  >
                    <span className="font-mono text-[11px] text-slate-700 truncate max-w-[240px]">
                      {inv.check_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {inv.violation_count} violasi
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          inv.status === "PASS"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]"
                            : "bg-rose-50 text-rose-700 border-rose-300 text-[10px]"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("audit")}
                  className="w-full mt-2 text-xs"
                >
                  Lihat Detail Audit Ledger
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: Manajemen Harga Model */}
        <TabsContent value="pricing" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Katalog & Dynamic Pricing Manager
                </CardTitle>
                <CardDescription className="text-xs">
                  Atur harga jual token per 1M (Input/Output dalam IDR), kelola status aktifasi, dan pantau estimasi margin kotor terhadap modal upstream 9router.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-60">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Cari model..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Tambah Model
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Model ID</TableHead>
                    <TableHead className="text-xs">Nama Display</TableHead>
                    <TableHead className="text-xs text-right">Harga Input / 1M</TableHead>
                    <TableHead className="text-xs text-right">Harga Output / 1M</TableHead>
                    <TableHead className="text-xs text-right">Estimasi Modal</TableHead>
                    <TableHead className="text-xs text-center">Gross Margin</TableHead>
                    <TableHead className="text-xs text-center">Status</TableHead>
                    <TableHead className="text-xs text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPricing.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground text-xs">
                        Tidak ada model yang sesuai dengan pencarian.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPricing.map((item) => {
                      const avgMargin = item.avg_gross_margin_pct ?? 0;
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs font-semibold text-slate-900">
                            {item.model_name}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-700">
                            {item.display_name}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-slate-900">
                            {formatCurrency(item.input_price_per_m)}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-slate-900">
                            {formatCurrency(item.output_price_per_m)}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-slate-500 text-[11px]">
                            {item.upstream_input_cost_per_m
                              ? `${formatCurrency(item.upstream_input_cost_per_m)} / ${formatCurrency(item.upstream_output_cost_per_m || 0)}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-mono ${
                                avgMargin >= 30
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : avgMargin >= 10
                                  ? "bg-amber-50 text-amber-700 border-amber-300"
                                  : "bg-rose-50 text-rose-700 border-rose-300"
                              }`}
                            >
                              {avgMargin > 0 ? `+${avgMargin}%` : `${avgMargin}%`}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={item.is_active}
                                onCheckedChange={() => handleToggleStatus(item)}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(item)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-slate-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Sinkronisasi 9router */}
        <TabsContent value="sync" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Server className="h-4 w-4 text-indigo-600" />
                  <span>Sinkronisasi Katalog dari Upstream 9router</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Deteksi model baru di 9router (`/v1/models`) yang belum terdaftar di database lokal, dan aktifkan dalam 1-klik.
                </CardDescription>
              </div>

              <Button
                onClick={handleSync9router}
                disabled={isSyncing}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 shadow-xs"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 mr-1.5 ${isSyncing ? "animate-spin" : ""}`}
                />
                {isSyncing ? "Menghubungi Upstream..." : "Sync dari 9router Sekarang"}
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-lg bg-slate-50 border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block">Upstream Endpoint:</span>
                  <code className="text-indigo-600 text-[11px]">
                    {syncResult?.upstreamUrl || "http://localhost:20128/v1/models"}
                  </code>
                </div>
                {syncResult && (
                  <Badge
                    variant="outline"
                    className={
                      syncResult.success
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-rose-50 text-rose-700 border-rose-300"
                    }
                  >
                    {syncResult.success ? "Terhubung" : "Gagal Terhubung"}
                  </Badge>
                )}
              </div>

              {syncResult && (
                <div className="space-y-4 pt-2">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                      Model Baru Terdeteksi ({syncResult.diff.newModels.length})
                    </h3>

                    {syncResult.diff.newModels.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground bg-slate-50/50">
                        Tidak ada model baru di upstream. Semua model telah tersinkronisasi dengan database lokal.
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Model ID</TableHead>
                              <TableHead className="text-xs">Owner / Provider</TableHead>
                              <TableHead className="text-xs text-right">Aksi 1-Click</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {syncResult.diff.newModels.map((m) => (
                              <TableRow key={m.id}>
                                <TableCell className="font-mono text-xs font-semibold text-slate-900">
                                  {m.id}
                                </TableCell>
                                <TableCell className="text-xs text-slate-600">
                                  {m.owned_by || "9router upstream"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    onClick={() => handleActivateNewModel(m.id)}
                                    disabled={activatingModelId === m.id}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2.5 shadow-2xs"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    {activatingModelId === m.id
                                      ? "Mengaktifkan..."
                                      : "1-Click Aktifkan"}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      Model Tersinkronisasi Aktif ({syncResult.diff.syncedModels.length})
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {syncResult.diff.syncedModels.map((m) => (
                        <Badge
                          key={m.id}
                          variant="outline"
                          className="font-mono text-[11px] bg-slate-50 text-slate-700"
                        >
                          {m.id}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {syncResult.diff.missingUpstreamModels.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        Model Lokal Tidak Ada di Upstream ({syncResult.diff.missingUpstreamModels.length})
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {syncResult.diff.missingUpstreamModels.map((id) => (
                          <Badge
                            key={id}
                            variant="outline"
                            className="font-mono text-[11px] bg-amber-50 text-amber-800 border-amber-200"
                          >
                            {id}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: Tiket Top-up */}
        <TabsContent value="topup" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>Antrean Persetujuan Top-up Saldo</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Verifikasi transfer manual QRIS / bank pengguna, cocokkan kode unik 3-digit, dan setujui penambahan saldo secara real-time.
                </CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshFinancialData}
                className="text-xs h-8"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Segarkan Antrean
              </Button>
            </CardHeader>

            <CardContent>
              {pendingTopups.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Tidak Ada Tiket Top-up Menunggu
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Seluruh tiket top-up pengguna telah diproses. Tiket baru yang masuk akan muncul secara otomatis di antrean ini.
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">ID Tiket</TableHead>
                        <TableHead className="text-xs">Pengguna</TableHead>
                        <TableHead className="text-xs text-right">Nominal Pokok</TableHead>
                        <TableHead className="text-xs text-center">Kode Unik</TableHead>
                        <TableHead className="text-xs text-right">Wajib Transfer</TableHead>
                        <TableHead className="text-xs text-center">Bukti</TableHead>
                        <TableHead className="text-xs">Waktu</TableHead>
                        <TableHead className="text-xs text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingTopups.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-mono text-xs font-bold text-slate-900">
                            #{ticket.id}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-semibold text-slate-900 block">
                              {ticket.user_name}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {ticket.telegram_id
                                ? `TG: ${ticket.telegram_id}`
                                : ticket.web_user_id
                                ? `Web: ${ticket.web_user_id.slice(0, 10)}...`
                                : `User #${ticket.user_id}`}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-slate-900">
                            {formatCurrency(ticket.amount)}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-center font-bold text-amber-700">
                            +{ticket.unique_code}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right font-bold text-emerald-700">
                            {formatCurrency(ticket.total_transfer)}
                          </TableCell>
                          <TableCell className="text-center">
                            {ticket.proof_file_id ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewProofTicket(ticket)}
                                className="h-6 text-[11px] px-2 text-indigo-600"
                              >
                                Lihat Bukti
                              </Button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                Belum ada bukti
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground text-[11px]">
                            {formatDate(ticket.created_at, {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => setApprovingTicket(ticket)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2.5 shadow-2xs"
                              >
                                Setujui
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRejectingTicket(ticket)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs h-7 px-2.5"
                              >
                                Tolak
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: Audit Ledger */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Live Database Invariant Audit Runner</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Eksekusi langsung stored procedure `verify_ledger_invariants()` pada database PostgreSQL `aldera_router` untuk memastikan kepatuhan 5 aturan invarian keuangan & telemetri.
                </CardDescription>
              </div>

              <Button
                onClick={handleRunAudit}
                disabled={isAuditing}
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 shadow-xs"
              >
                <ShieldCheck
                  className={`h-3.5 w-3.5 mr-1.5 ${isAuditing ? "animate-pulse" : ""}`}
                />
                {isAuditing ? "Menjalankan Prosedur..." : "Jalankan Audit Sekarang"}
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b">
                <span>
                  Status Terakhir:{" "}
                  <strong className={allInvariantsPass ? "text-emerald-700" : "text-rose-600"}>
                    {allInvariantsPass ? "5 dari 5 Invarian PASS (0 Pelanggaran)" : "Ditemukan Pelanggaran Invarian!"}
                  </strong>
                </span>
                <span>
                  Terakhir diaudit: {formatDate(lastAuditedAt, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {auditResults.map((inv, idx) => (
                  <div
                    key={inv.check_name}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      inv.status === "PASS"
                        ? "bg-emerald-50/30 border-emerald-200"
                        : "bg-rose-50/30 border-rose-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          #{idx + 1}. {inv.check_name}
                        </span>
                        <Badge
                          className={
                            inv.status === "PASS"
                              ? "bg-emerald-600 text-white"
                              : "bg-rose-600 text-white"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        {inv.details || "Pengecekan integritas invarian pada database."}
                      </p>
                    </div>

                    <div className="text-right sm:text-right shrink-0">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Violasi Terdeteksi
                      </span>
                      <span
                        className={`text-lg font-extrabold font-mono ${
                          inv.violation_count === 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {inv.violation_count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG: Tambah Model Baru */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Tambah Model Baru ke Katalog
            </DialogTitle>
            <DialogDescription className="text-xs">
              Masukkan spesifikasi model dan harga per 1,000,000 token dalam Rupiah.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="model_name" className="text-xs font-semibold">
                Model ID (Resmi API)
              </Label>
              <Input
                id="model_name"
                placeholder="misal: gpt-4.5-preview"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="display_name" className="text-xs font-semibold">
                Nama Display
              </Label>
              <Input
                id="display_name"
                placeholder="misal: GPT-4.5 Preview"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="input_price" className="text-xs font-semibold">
                  Harga Jual Input / 1M
                </Label>
                <Input
                  id="input_price"
                  type="number"
                  value={newInputPrice}
                  onChange={(e) => setNewInputPrice(Number(e.target.value))}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="output_price" className="text-xs font-semibold">
                  Harga Jual Output / 1M
                </Label>
                <Input
                  id="output_price"
                  type="number"
                  value={newOutputPrice}
                  onChange={(e) => setNewOutputPrice(Number(e.target.value))}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="upstream_cost" className="text-xs font-semibold">
                Estimasi Modal Upstream 9router / 1M
              </Label>
              <Input
                id="upstream_cost"
                type="number"
                value={newUpstreamCost}
                onChange={(e) => setNewUpstreamCost(Number(e.target.value))}
                className="font-mono text-xs"
              />
            </div>

            <div className="rounded-lg bg-slate-50 border p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-700 block">
                  Estimasi Gross Margin:
                </span>
                <span className="text-[10px] text-muted-foreground">
                  (Harga Jual Input - Modal Upstream) / Harga Jual
                </span>
              </div>
              <Badge
                className={`font-mono text-xs ${
                  calculateGrossMarginPercentage(newInputPrice, newUpstreamCost) >= 30
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-600 text-white"
                }`}
              >
                {calculateGrossMarginPercentage(newInputPrice, newUpstreamCost)}%
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleCreateModel}
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
            >
              Simpan & Aktifkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Edit Harga Model */}
      <Dialog
        open={Boolean(editingModel)}
        onOpenChange={(open) => !open && setEditingModel(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Edit Harga Model: {editingModel?.model_name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Perbarui harga per 1M token dan nama display model.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nama Display</Label>
              <Input
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Harga Input / 1M</Label>
                <Input
                  type="number"
                  value={editInputPrice}
                  onChange={(e) => setEditInputPrice(Number(e.target.value))}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Harga Output / 1M</Label>
                <Input
                  type="number"
                  value={editOutputPrice}
                  onChange={(e) => setEditOutputPrice(Number(e.target.value))}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {editingModel?.upstream_input_cost_per_m && (
              <div className="rounded-lg bg-slate-50 border p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-700 block">
                    Gross Margin Input Baru:
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Modal upstream: {formatCurrency(editingModel.upstream_input_cost_per_m)}
                  </span>
                </div>
                <Badge
                  className={`font-mono text-xs ${
                    calculateGrossMarginPercentage(
                      editInputPrice,
                      editingModel.upstream_input_cost_per_m
                    ) >= 30
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {calculateGrossMarginPercentage(
                    editInputPrice,
                    editingModel.upstream_input_cost_per_m
                  )}
                  %
                </Badge>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingModel(null)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Konfirmasi Approve Top-up */}
      <Dialog
        open={Boolean(approvingTicket)}
        onOpenChange={(open) => !open && setApprovingTicket(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-emerald-800">
              Setujui Tiket Top-up #{approvingTicket?.id}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Konfirmasi persetujuan transfer dana pengguna. Saldo akan otomatis ditambahkan ke akun pengguna secara atomik.
            </DialogDescription>
          </DialogHeader>

          {approvingTicket && (
            <div className="space-y-2 py-2 text-xs">
              <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Pengguna:</span>
                  <span className="font-semibold text-slate-900">
                    {approvingTicket.user_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Nominal Pokok:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(approvingTicket.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kode Unik:</span>
                  <span className="font-mono font-bold text-amber-700">
                    +{approvingTicket.unique_code}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-slate-700">
                    Total Transfer Wajib:
                  </span>
                  <span className="font-mono font-extrabold text-emerald-700 text-sm">
                    {formatCurrency(approvingTicket.total_transfer)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setApprovingTicket(null)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmApprove}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              Ya, Setujui & Tambah Saldo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Konfirmasi Reject Top-up */}
      <Dialog
        open={Boolean(rejectingTicket)}
        onOpenChange={(open) => !open && setRejectingTicket(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-rose-800">
              Tolak Tiket Top-up #{rejectingTicket?.id}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tiket ini akan ditandai sebagai ditolak (`rejected`) dan saldo tidak akan ditambahkan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">
                Alasan Penolakan (Opsional)
              </Label>
              <Input
                placeholder="misal: Bukti transfer tidak valid atau dana belum masuk"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectingTicket(null)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmReject}
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
            >
              Konfirmasi Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Lihat Bukti Transfer */}
      <Dialog
        open={Boolean(viewProofTicket)}
        onOpenChange={(open) => !open && setViewProofTicket(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Bukti Transfer Tiket #{viewProofTicket?.id}
            </DialogTitle>
            <DialogDescription className="text-xs">
              ID Berkas Bukti: {viewProofTicket?.proof_file_id}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-center">
            {viewProofTicket?.proof_file_id ? (
              <div className="rounded-lg border p-4 bg-slate-50 flex flex-col items-center gap-2">
                <span className="font-mono text-xs text-slate-700">
                  {viewProofTicket.proof_file_id}
                </span>
                <p className="text-xs text-muted-foreground">
                  Berkas bukti transfer tercatat pada sistem penyimpanan.
                </p>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewProofTicket(null)}
              className="text-xs"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
