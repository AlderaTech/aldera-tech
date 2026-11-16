"use client";
import {
  activateNewModelFromUpstream,
  approveTopupRequest,
  createModelPricing,
  getFinancialMetrics,
  getModelPricings,
  getPendingTopupRequests,
  rejectTopupRequest,
  runLedgerAudit,
  syncModelsFromUpstream,
  toggleModelPricingStatus,
  updateModelPricing,
} from "@/lib/actions/admin-ai-relay";
import {
  type FinancialMetricsSummary,
  type ModelPricingItem,
  type ModelSyncDiffResult,
  type PendingTopupRequestItem,
} from "@/lib/ai-relay-utils";
import { useRevealActiveTab } from "@/lib/hooks/use-reveal-active-tab";
import { useUrlState } from "@/lib/hooks/use-url-state";
import type { LedgerInvariantResult } from "@/lib/router-db";
import { ledgerAuditSummary } from "../_utils/ledger-audit-summary";
import { useEffect, useRef, useState, useTransition } from "react";

const ALLOWED_TABS = ["overview", "pricing", "sync", "topup", "audit"] as const;
type AiRelayTab = (typeof ALLOWED_TABS)[number];

export interface AdminClientViewProps {
  initialPricing: ModelPricingItem[];
  initialMetrics: FinancialMetricsSummary;
  initialPendingTopups: PendingTopupRequestItem[];
  initialAuditResults: LedgerInvariantResult[];
}

export function useAdminAiRelay({
  initialPricing,
  initialMetrics,
  initialPendingTopups,
  initialAuditResults,
}: AdminClientViewProps) {
  const { getParam, setParam } = useUrlState();
  const tabParam = getParam("tab", "overview");
  const activeTab = ALLOWED_TABS.includes(tabParam as AiRelayTab)
    ? tabParam
    : "overview";
  const setActiveTab = (tab: string) => setParam("tab", tab);
  const tabRef = useRef<HTMLDivElement>(null);
  useRevealActiveTab(tabRef, activeTab);

  const [isPending, startTransition] = useTransition();

  // Financial Metrics State
  const [metrics, setMetrics] =
    useState<FinancialMetricsSummary>(initialMetrics);

  // Model Pricing State (F14)
  const [pricingList, setPricingList] =
    useState<ModelPricingItem[]>(initialPricing);
  const queryParam = getParam("q", "");
  const [modelSearch, setModelSearch] = useState<string>(queryParam);
  const [prevQueryParam, setPrevQueryParam] = useState<string>(queryParam);

  // Sync external changes in query param (e.g. back/forward navigation)
  if (prevQueryParam !== queryParam) {
    setPrevQueryParam(queryParam);
    setModelSearch(queryParam);
  }

  // Debounce sync to URL query parameter ?q=
  useEffect(() => {
    const timer = setTimeout(() => {
      if (modelSearch !== queryParam) {
        setParam("q", modelSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [modelSearch, queryParam, setParam]);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingModel, setEditingModel] = useState<ModelPricingItem | null>(
    null
  );

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
  const [editUpstreamCost, setEditUpstreamCost] = useState(0);

  // 9router Sync State (F15)
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    upstreamUrl: string;
    diff: ModelSyncDiffResult;
    error?: string;
  } | null>(null);
  const [activatingModelId, setActivatingModelId] = useState<string | null>(
    null
  );

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
          prev.map((p) =>
            p.id === item.id ? { ...p, is_active: nextStatus } : p
          )
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
    setEditUpstreamCost(item.upstream_input_cost_per_m ?? 0);
  };

  const handleSaveEdit = async () => {
    if (!editingModel) return;
    startTransition(async () => {
      try {
        await updateModelPricing(editingModel.id, {
          display_name: editDisplayName,
          input_price_per_m: Number(editInputPrice),
          output_price_per_m: Number(editOutputPrice),
          upstream_input_cost_per_m: Number(editUpstreamCost),
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
          err instanceof Error
            ? err.message
            : "Gagal menyimpan perubahan harga."
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
          upstream_input_cost_per_m: Number(newUpstreamCost),
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
              newModels: syncResult.diff.newModels.filter(
                (m) => m.id !== modelId
              ),
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
      const summary = ledgerAuditSummary(results);
      showNotification(summary.type, summary.message);
    } catch (err) {
      showNotification(
        "error",
        err instanceof Error ? err.message : "Gagal menjalankan audit ledger."
      );
    } finally {
      setIsAuditing(false);
    }
  };

  const allInvariantsPass =
    auditResults.length > 0 && auditResults.every((r) => r.status === "PASS");

  return {
    activeTab,
    setActiveTab,
    tabRef,
    isPending,
    metrics,
    pricingList,
    modelSearch,
    setModelSearch,
    isAddModalOpen,
    setIsAddModalOpen,
    editingModel,
    setEditingModel,
    newModelName,
    setNewModelName,
    newDisplayName,
    setNewDisplayName,
    newInputPrice,
    setNewInputPrice,
    newOutputPrice,
    setNewOutputPrice,
    newUpstreamCost,
    setNewUpstreamCost,
    editDisplayName,
    setEditDisplayName,
    editInputPrice,
    setEditInputPrice,
    editOutputPrice,
    setEditOutputPrice,
    editUpstreamCost,
    setEditUpstreamCost,
    isSyncing,
    syncResult,
    activatingModelId,
    pendingTopups,
    approvingTicket,
    setApprovingTicket,
    rejectingTicket,
    setRejectingTicket,
    rejectReason,
    setRejectReason,
    viewProofTicket,
    setViewProofTicket,
    auditResults,
    isAuditing,
    lastAuditedAt,
    notification,
    setNotification,
    handleToggleStatus,
    handleOpenEdit,
    handleSaveEdit,
    handleCreateModel,
    filteredPricing,
    handleSync9router,
    handleActivateNewModel,
    refreshFinancialData,
    handleConfirmApprove,
    handleConfirmReject,
    handleRunAudit,
    allInvariantsPass,
  };
}
export type AdminAiRelayState = ReturnType<typeof useAdminAiRelay>;
