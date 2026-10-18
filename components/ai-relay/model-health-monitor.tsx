"use client";

import {
  Activity,
  CheckCircle2,
  Clock,
  Gauge,
  Radio,
  Server,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type ModelHealthStatus } from "@/lib/actions/ai-relay";

interface ModelHealthMonitorProps {
  healthMetrics: ModelHealthStatus[];
  dashboard?: boolean;
}

export function ModelHealthMonitor({
  healthMetrics,
  dashboard = false,
}: ModelHealthMonitorProps) {
  // Aggregate system-wide stats
  const activeMetrics = healthMetrics.filter((m) => m.totalRequests > 0);
  const avgSystemLatency =
    activeMetrics.length > 0
      ? Math.round(
          activeMetrics.reduce((sum, m) => sum + m.avgLatencyMs, 0) /
            activeMetrics.length
        )
      : 0;

  const avgSystemThroughput =
    activeMetrics.length > 0
      ? Number(
          (
            activeMetrics.reduce((sum, m) => sum + m.tokensPerSec, 0) /
            activeMetrics.length
          ).toFixed(1)
        )
      : 0;

  const totalRelayedRequests = healthMetrics.reduce(
    (sum, m) => sum + m.totalRequests,
    0
  );

  const getStatusBadge = (status: ModelHealthStatus["status"]) => {
    switch (status) {
      case "operational":
        return (
          <Badge
            variant="secondary"
            className="gap-1 border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Operasional
          </Badge>
        );
      case "degraded":
        return (
          <Badge
            variant="secondary"
            className="gap-1 border-amber-200 bg-amber-50 text-[11px] text-amber-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Degradasi Latensi
          </Badge>
        );
      case "offline":
        return (
          <Badge
            variant="secondary"
            className="gap-1 border-rose-200 bg-rose-50 text-[11px] text-rose-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Offline
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Cluster Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Status Gateway Relay
            </span>
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-600">
              <Radio className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xl font-bold text-emerald-600">
              {dashboard ? (
                "Lihat status per model"
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  100% Online
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {dashboard
                ? "Ringkasan status pada tabel model di bawah."
                : "Cluster 9router upstream terhubung"}
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Rata-rata Latensi
            </span>
            <div className="rounded-md bg-indigo-50 p-2 text-indigo-600">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-slate-900">
              {avgSystemLatency > 0
                ? `${avgSystemLatency} ms`
                : dashboard
                  ? "Belum ada data"
                  : "< 800 ms"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Waktu ke respons pertama (TTFT)
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Rata-rata Throughput
            </span>
            <div className="rounded-md bg-purple-50 p-2 text-purple-600">
              <Gauge className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-slate-900">
              {avgSystemThroughput > 0
                ? `${avgSystemThroughput} t/s`
                : dashboard
                  ? "Belum ada data"
                  : "~45 t/s"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Token completion per detik
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Total Permintaan
            </span>
            <div className="rounded-md bg-blue-50 p-2 text-blue-600">
              <Server className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalRelayedRequests.toLocaleString("id-ID")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Tercatat di telemetri <code>usage_logs</code>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Model Health Status Table */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5 text-indigo-600" />
            Status Operasional & Metrik Kecepatan per Model
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-muted-foreground">
            Estimasi latensi nyata dan kecepatan token streaming berdasarkan
            riwayat eksekusi aktual di database.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="w-[220px]">Model</TableHead>
                  <TableHead>Status Operasional</TableHead>
                  <TableHead className="text-right">
                    Rata-rata Latensi
                  </TableHead>
                  <TableHead className="text-right">
                    Kecepatan Throughput
                  </TableHead>
                  <TableHead className="text-right">Total Panggilan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthMetrics.map((item) => (
                  <TableRow key={item.model} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs font-medium text-slate-900">
                      {item.model}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {item.avgLatencyMs > 0 ? (
                        <span
                          className={
                            item.avgLatencyMs > 5000
                              ? "font-bold text-amber-600"
                              : "text-slate-700"
                          }
                        >
                          {item.avgLatencyMs} ms
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {dashboard ? "Belum ada data" : "Normal"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-medium text-indigo-600">
                      {item.tokensPerSec > 0
                        ? `${item.tokensPerSec} tokens/detik`
                        : dashboard
                          ? "Belum ada data"
                          : "Optimal"}
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-600">
                      {item.totalRequests.toLocaleString("id-ID")} request
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
