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
import { formatDate } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";
import type { AdminAiRelayState } from "../_hooks/use-admin-ai-relay";
import {
  getLedgerCheckDescription,
  getLedgerCheckLabel,
} from "../_utils/ledger-check-label";
export function AdminRelayAuditTab({ state }: { state: AdminAiRelayState }) {
  const {
    auditResults,
    isAuditing,
    lastAuditedAt,
    handleRunAudit,
    allInvariantsPass,
  } = state;
  return (
    <TabsContent value="audit" className="space-y-4">
      <Card className="shadow-2xs">
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Pemeriksaan Integritas Buku Besar</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Eksekusi langsung stored procedure `verify_ledger_invariants()`
              pada database PostgreSQL `aldera_router` untuk memastikan
              kepatuhan 5 aturan invarian keuangan & telemetri.
            </CardDescription>
          </div>

          <Button
            onClick={handleRunAudit}
            disabled={isAuditing}
            size="sm"
            className="h-9 bg-primary text-xs text-white shadow-xs hover:bg-primary/90"
          >
            <ShieldCheck
              className={`mr-1.5 h-3.5 w-3.5 ${isAuditing ? "animate-pulse" : ""}`}
            />
            {isAuditing ? "Menjalankan Prosedur..." : "Jalankan Audit Sekarang"}
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2 text-xs text-muted-foreground">
            <span>
              Status Terakhir:{" "}
              <strong
                className={
                  auditResults.length === 0
                    ? "text-slate-600"
                    : allInvariantsPass
                      ? "text-emerald-700"
                      : "text-rose-600"
                }
              >
                {auditResults.length === 0
                  ? "Belum ada hasil pemeriksaan"
                  : allInvariantsPass
                    ? "5 dari 5 Invarian PASS (0 Pelanggaran)"
                    : "Ditemukan Pelanggaran Invarian!"}
              </strong>
            </span>
            <span>
              Terakhir diaudit:{" "}
              {formatDate(lastAuditedAt, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {auditResults.length === 0 && <AdminEmptyState context="ledger" />}
            {auditResults.map((inv, idx) => (
              <div
                key={inv.check_name}
                className={`flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center ${
                  inv.status === "PASS"
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-rose-200 bg-rose-50/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm leading-relaxed font-semibold text-slate-800">
                      #{idx + 1}. {getLedgerCheckLabel(inv.check_name)}
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
                    {getLedgerCheckDescription(inv.check_name)}
                  </p>
                </div>

                <div className="shrink-0 text-right sm:text-right">
                  <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    Violasi Terdeteksi
                  </span>
                  <span
                    className={`font-mono text-lg font-extrabold ${
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
  );
}
