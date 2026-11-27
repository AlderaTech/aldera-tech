"use client";
import { AdminEmptyState } from "@/app/admin/_components/admin-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Cpu, DollarSign, ShieldCheck, TrendingUp } from "lucide-react";
import type { AdminAiRelayState } from "../_hooks/use-admin-ai-relay";
import { getLedgerCheckLabel } from "../_utils/ledger-check-label";
export function AdminRelayOverviewTab({ state }: { state: AdminAiRelayState }) {
  const { setActiveTab, metrics, auditResults, allInvariantsPass } = state;
  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Total Omzet Top-up
            </CardTitle>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-slate-900">
              {formatCurrency(metrics.totalOmzet)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Dari {metrics.approvedCount} tiket top-up disetujui
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Volume Token Terpakai
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Cpu className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-slate-900">
              {metrics.totalTokens.toLocaleString("id-ID")}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Prompt + Completion tokens
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Total Biaya Pemakaian
            </CardTitle>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-slate-900">
              {formatCurrency(metrics.totalUsageCost)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Pengurangan saldo dari gateway relay
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Net Margin Kas
            </CardTitle>
            <div
              className={`rounded-lg p-2 ${
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
              className={`font-mono text-2xl font-bold ${
                metrics.netMargin >= 0 ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {formatCurrency(metrics.netMargin)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Omzet - Biaya terpakai
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-semibold">
              <span>Status Antrean Top-up</span>
              <Badge variant="outline">{metrics.pendingCount} Menunggu</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Ringkasan status permintaan pengisian saldo dari pengguna
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between border-b py-1.5 text-xs">
              <span className="text-muted-foreground">
                Menunggu Persetujuan (Pending)
              </span>
              <span className="font-bold text-amber-600">
                {metrics.pendingCount} tiket
              </span>
            </div>
            <div className="flex items-center justify-between border-b py-1.5 text-xs">
              <span className="text-muted-foreground">
                Telah Disetujui (Approved)
              </span>
              <span className="font-bold text-emerald-600">
                {metrics.approvedCount} tiket
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-muted-foreground">
                Telah Ditolak (Rejected)
              </span>
              <span className="font-bold text-slate-500">
                {metrics.rejectedCount} tiket
              </span>
            </div>

            {metrics.pendingCount > 0 && (
              <Button
                size="sm"
                onClick={() => setActiveTab("topup")}
                className="mt-2 w-full bg-amber-600 text-xs text-white hover:bg-amber-700"
              >
                Buka Antrean Top-up ({metrics.pendingCount})
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-semibold">
              <span>Status Integritas Audit Ledger</span>
              <Badge
                className={
                  auditResults.length === 0
                    ? "border-slate-200 bg-slate-50 text-slate-600"
                    : allInvariantsPass
                      ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                      : "border-rose-300 bg-rose-100 text-rose-800"
                }
              >
                {auditResults.length === 0
                  ? "Belum ada hasil"
                  : allInvariantsPass
                    ? "SEMUA PASS"
                    : "ADA MASALAH"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Hasil diagnostik prosedur `verify_ledger_invariants()` PostgreSQL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {auditResults.length === 0 && <AdminEmptyState context="ledger" />}
            {auditResults.map((inv) => (
              <div
                key={inv.check_name}
                className="flex items-center justify-between border-b py-1.5 text-xs last:border-0"
              >
                <span className="min-w-0 text-sm leading-relaxed font-medium text-slate-700">
                  {getLedgerCheckLabel(inv.check_name)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    {inv.violation_count} violasi
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      inv.status === "PASS"
                        ? "border-emerald-300 bg-emerald-50 text-[10px] text-emerald-700"
                        : "border-rose-300 bg-rose-50 text-[10px] text-rose-700"
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
              className="mt-2 w-full text-xs"
            >
              Lihat Detail Audit Ledger
            </Button>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
