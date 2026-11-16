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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { AlertCircle, Check, RefreshCw, Server } from "lucide-react";
import type { AdminAiRelayState } from "../_hooks/use-admin-ai-relay";
export function AdminRelaySyncTab({ state }: { state: AdminAiRelayState }) {
  const {
    isSyncing,
    syncResult,
    activatingModelId,
    handleSync9router,
    handleActivateNewModel,
  } = state;
  return (
    <TabsContent value="sync" className="space-y-4">
      <Card className="shadow-2xs">
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Server className="h-4 w-4 text-primary" />
              <span>Sinkronisasi Katalog dari Upstream 9router</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Deteksi model baru di 9router (`/v1/models`) yang belum terdaftar
              di database lokal, dan aktifkan dalam 1-klik.
            </CardDescription>
          </div>

          <Button
            onClick={handleSync9router}
            disabled={isSyncing}
            size="sm"
            className="h-9 bg-primary text-xs text-white shadow-xs hover:bg-primary/90"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing
              ? "Menghubungi Upstream..."
              : "Sync dari 9router Sekarang"}
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col justify-between gap-2 rounded-lg border bg-slate-50 p-3 text-xs sm:flex-row sm:items-center">
            <div>
              <span className="block font-semibold text-slate-700">
                Upstream Endpoint:
              </span>
              <code className="text-[11px] text-primary">
                {syncResult?.upstreamUrl || "http://localhost:20128/v1/models"}
              </code>
            </div>
            {syncResult && (
              <Badge
                variant="outline"
                className={
                  syncResult.success
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-rose-300 bg-rose-50 text-rose-700"
                }
              >
                {syncResult.success ? "Terhubung" : "Gagal Terhubung"}
              </Badge>
            )}
          </div>

          {syncResult && !syncResult.success && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <div className="space-y-1">
                    <p className="font-semibold text-rose-900">
                      Sinkronisasi Upstream 9router Gagal
                    </p>
                    <p className="text-rose-700">
                      {syncResult.error ||
                        "Gagal terhubung ke upstream 9router."}
                    </p>
                    <p className="text-[11px] text-rose-600/90">
                      Katalog model lokal tetap aktif dan dapat dikelola.
                      Pastikan upstream 9router dapat diakses dan konfigurasi
                      environment telah sesuai.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleSync9router}
                  disabled={isSyncing}
                  size="sm"
                  variant="outline"
                  className="shrink-0 self-start border-rose-300 bg-white text-xs text-rose-700 shadow-2xs hover:bg-rose-50 hover:text-rose-800 sm:self-center"
                >
                  <RefreshCw
                    className={`mr-1.5 h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {isSyncing ? "Mencoba Ulang..." : "Coba Lagi"}
                </Button>
              </div>
            </div>
          )}

          {syncResult && syncResult.success && (
            <div className="space-y-4 pt-2">
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-900 uppercase">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  Model Baru Terdeteksi ({syncResult.diff.newModels.length})
                </h3>

                {syncResult.diff.newModels.length === 0 ? (
                  <AdminEmptyState context="sync" />
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Model ID</TableHead>
                          <TableHead className="text-xs">
                            Owner / Provider
                          </TableHead>
                          <TableHead className="text-right text-xs">
                            Aksi 1-Click
                          </TableHead>
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
                                className="h-7 bg-emerald-600 px-2.5 text-xs text-white shadow-2xs hover:bg-emerald-700"
                              >
                                <Check className="mr-1 h-3 w-3" />
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
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-900 uppercase">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Model Tersinkronisasi Aktif (
                  {syncResult.diff.syncedModels.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {syncResult.diff.syncedModels.length === 0 && (
                    <AdminEmptyState
                      context="sync"
                      title="Tidak ada model yang diperbarui"
                    />
                  )}
                  {syncResult.diff.syncedModels.map((m) => (
                    <Badge
                      key={m.id}
                      variant="outline"
                      className="bg-slate-50 font-mono text-[11px] text-slate-700"
                    >
                      {m.id}
                    </Badge>
                  ))}
                </div>
              </div>

              {syncResult.diff.missingUpstreamModels.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-amber-800 uppercase">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Model Lokal Tidak Ada di Upstream (
                    {syncResult.diff.missingUpstreamModels.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {syncResult.diff.missingUpstreamModels.map((id) => (
                      <Badge
                        key={id}
                        variant="outline"
                        className="border-amber-200 bg-amber-50 font-mono text-[11px] text-amber-800"
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
  );
}
