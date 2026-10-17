"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart2,
  Clock,
  Cpu,
  CreditCard,
  Layers,
  Sparkles,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type UsageAnalyticsSummary,
  type UsageLogRecord,
} from "@/lib/actions/ai-relay";
import { formatCurrency, formatDate } from "@/lib/utils";

const MODEL_COLORS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#3b82f6", // blue
];

const CHART_INITIAL_DIMENSION = { width: 640, height: 260 };

interface UsageAnalyticsChartsProps {
  summary: UsageAnalyticsSummary;
  logs: UsageLogRecord[];
}

export function UsageAnalyticsCharts({
  summary,
  logs,
}: UsageAnalyticsChartsProps) {
  const [activeChartTab, setActiveChartTab] = useState<string>("tokens");

  // Format data for model breakdown pie chart
  const modelPieData = Object.entries(summary.modelBreakdown).map(
    ([name, stats]) => ({
      name,
      value: stats.tokens,
      costIdr: stats.costIdr,
      requestCount: stats.requestCount,
    })
  );

  // Find most used model
  let mostUsedModel = "-";
  let maxRequests = 0;
  for (const [model, stats] of Object.entries(summary.modelBreakdown)) {
    if (stats.requestCount > maxRequests) {
      maxRequests = stats.requestCount;
      mostUsedModel = model;
    }
  }

  return (
    <div className="space-y-6">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Total Token
            </span>
            <div className="rounded-md bg-indigo-50 p-2 text-indigo-600">
              <Cpu className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {summary.totalTokens.toLocaleString("id-ID")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.totalPromptTokens.toLocaleString("id-ID")} prompt +{" "}
              {summary.totalCompletionTokens.toLocaleString("id-ID")} completion
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Total Pengeluaran
            </span>
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary.totalCostIdr)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Total biaya pemakaian seluruh API Key
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Total Permintaan
            </span>
            <div className="rounded-md bg-blue-50 p-2 text-blue-600">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {summary.totalRequests.toLocaleString("id-ID")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Relay chat & API completions
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Model Terpopuler
            </span>
            <div className="rounded-md bg-purple-50 p-2 text-purple-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="truncate text-lg font-bold text-slate-900">
              {mostUsedModel}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {maxRequests} kali dipanggil
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Recharts Tabs */}
      <Card className="border shadow-xs">
        <CardHeader className="flex flex-col gap-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <BarChart2 className="h-5 w-5 text-indigo-600" />
              Grafik Analitik Pemakaian
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs text-muted-foreground">
              Tren volume token harian, pengeluaran IDR, serta komposisi
              penggunaan model.
            </CardDescription>
          </div>

          <Tabs
            value={activeChartTab}
            onValueChange={setActiveChartTab}
            className="w-auto"
          >
            <TabsList className="h-8 bg-slate-100 p-0.5">
              <TabsTrigger value="tokens" className="h-7 px-3 text-xs">
                Konsumsi Token
              </TabsTrigger>
              <TabsTrigger value="cost" className="h-7 px-3 text-xs">
                Biaya (IDR)
              </TabsTrigger>
              <TabsTrigger value="models" className="h-7 px-3 text-xs">
                Sebaran Model
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {summary.dailyStats.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
              <Layers className="mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">
                Belum ada data pemakaian untuk divisualisasikan
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Mulai kirim prompt melalui Playground atau IDE untuk melihat
                tren analitik.
              </p>
            </div>
          ) : (
            <>
              {/* Daily Token Consumption AreaChart */}
              {activeChartTab === "tokens" && (
                <div className="h-72 w-full min-w-0">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                    minHeight={260}
                    initialDimension={CHART_INITIAL_DIMENSION}
                  >
                    <AreaChart
                      data={summary.dailyStats}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="tokenPromptGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366f1"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="tokenCompGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        strokeOpacity={0.2}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => {
                          if (v >= 1_000_000)
                            return `${(v / 1_000_000).toFixed(1)}M`;
                          if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                          return String(v);
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.5rem",
                          fontSize: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconSize={10}
                        wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="promptTokens"
                        name="Prompt Tokens"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="url(#tokenPromptGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="completionTokens"
                        name="Completion Tokens"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#tokenCompGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Daily IDR Expenditure BarChart */}
              {activeChartTab === "cost" && (
                <div className="h-72 w-full min-w-0">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                    minHeight={260}
                    initialDimension={CHART_INITIAL_DIMENSION}
                  >
                    <BarChart
                      data={summary.dailyStats}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        strokeOpacity={0.2}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => {
                          if (v >= 1_000_000)
                            return `${(v / 1_000_000).toFixed(0)}jt`;
                          if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
                          return String(v);
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.5rem",
                          fontSize: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(val) => [
                          formatCurrency(Number(val)),
                          "Biaya Pemakaian",
                        ]}
                      />
                      <Bar
                        dataKey="costIdr"
                        name="Biaya (IDR)"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Model Breakdown Pie Chart */}
              {activeChartTab === "models" && (
                <div className="flex h-72 w-full min-w-0 flex-col items-center justify-around md:flex-row">
                  <div className="h-64 w-full md:w-1/2">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minWidth={0}
                      minHeight={250}
                      initialDimension={CHART_INITIAL_DIMENSION}
                    >
                      <PieChart>
                        <Pie
                          data={modelPieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {modelPieData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={MODEL_COLORS[i % MODEL_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.5rem",
                            fontSize: "12px",
                          }}
                          formatter={(val, name, item) => [
                            `${Number(val).toLocaleString("id-ID")} tokens (${formatCurrency(
                              item.payload.costIdr
                            )})`,
                            String(name),
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full space-y-2 pr-4 text-xs md:w-1/2">
                    <p className="font-semibold text-slate-700">
                      Rincian per Model:
                    </p>
                    <div className="divide-y rounded-lg border bg-slate-50/50">
                      {modelPieData.map((item, i) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  MODEL_COLORS[i % MODEL_COLORS.length],
                              }}
                            />
                            <span className="max-w-[140px] truncate font-mono font-medium text-slate-800">
                              {item.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block font-semibold text-slate-900">
                              {formatCurrency(item.costIdr)}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {item.value.toLocaleString("id-ID")} token (
                              {item.requestCount}x)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card className="border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-slate-600" />
              Tabel Log Aktivitas Permintaan
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs text-muted-foreground">
              Riwayat telemetri real-time dari tabel <code>usage_logs</code>.
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {logs.length} Log
          </Badge>
        </CardHeader>

        <CardContent>
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                Belum ada log aktivitas
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Setiap panggilan API relay akan mencatat token, durasi, dan
                biaya di sini.
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-slate-50/80">
                  <TableRow>
                    <TableHead className="w-[150px]">Waktu</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Prompt</TableHead>
                    <TableHead className="text-right">Completion</TableHead>
                    <TableHead className="text-right">Total Token</TableHead>
                    <TableHead className="text-right">Biaya (IDR)</TableHead>
                    <TableHead className="text-right">Durasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-xs font-medium text-slate-600">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-xs font-medium text-indigo-700">
                          {log.model}
                        </code>
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-600">
                        {log.prompt_tokens.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-600">
                        {log.completion_tokens.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold text-slate-800">
                        {(
                          log.prompt_tokens + log.completion_tokens
                        ).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold text-emerald-600">
                        {formatCurrency(log.total_cost)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-slate-500">
                        {log.duration_ms}ms
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
