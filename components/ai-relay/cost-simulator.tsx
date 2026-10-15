"use client";

import { useState } from "react";
import {
  Calculator,
  Sliders,
  TrendingDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  calculateMonthlyCost,
  type ModelCatalogItem,
} from "@/lib/ai-relay-utils";
import { formatCurrency } from "@/lib/utils";

interface CostSimulatorProps {
  catalog: ModelCatalogItem[];
}

export function CostSimulator({ catalog }: CostSimulatorProps) {
  const activeModels = catalog.filter((m) => m.isActive);

  // Model selection for comparison
  const [modelAId, setModelAId] = useState<string>(
    activeModels.find((m) => m.id === "claude-3-5-sonnet-20241022")?.id ||
      activeModels[0]?.id ||
      ""
  );
  const [modelBId, setModelBId] = useState<string>(
    activeModels.find((m) => m.id === "deepseek-chat")?.id ||
      activeModels[1]?.id ||
      ""
  );

  // Simulator parameters
  const [dailyRequests, setDailyRequests] = useState<number>(100);
  const [avgPromptTokens, setAvgPromptTokens] = useState<number>(2000);
  const [avgCompletionTokens, setAvgCompletionTokens] = useState<number>(500);

  const modelA = catalog.find((m) => m.id === modelAId);
  const modelB = catalog.find((m) => m.id === modelBId);

  // Calculations
  const costA = modelA
    ? calculateMonthlyCost(
        dailyRequests,
        avgPromptTokens,
        avgCompletionTokens,
        modelA.inputPricePerM,
        modelA.outputPricePerM
      )
    : 0;

  const costB = modelB
    ? calculateMonthlyCost(
        dailyRequests,
        avgPromptTokens,
        avgCompletionTokens,
        modelB.inputPricePerM,
        modelB.outputPricePerM
      )
    : 0;

  const costDiff = Math.abs(costA - costB);
  const higherModel = costA >= costB ? modelA?.displayName : modelB?.displayName;
  const lowerModel = costA >= costB ? modelB?.displayName : modelA?.displayName;
  const higherCost = Math.max(costA, costB);
  const savingsPercent =
    higherCost > 0 ? Math.round((costDiff / higherCost) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Side-by-Side Model Comparison Tool */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-600" />
            Komparasi Model Berdampingan (Side-by-Side)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Bandingkan harga, batas konteks, dan kapabilitas antar model sebelum
            menentukan arsitektur relay Anda.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model A Selector & Card */}
            <div className="rounded-xl border p-4 space-y-3 bg-slate-50/60">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Model Pilihan Pertama (A):
                </Label>
                <Select value={modelAId} onValueChange={setModelAId}>
                  <SelectTrigger className="h-9 text-xs bg-white font-medium">
                    <SelectValue placeholder="Pilih Model A" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeModels.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="text-xs">
                        {m.displayName} ({m.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {modelA && (
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Kategori:</span>
                    <Badge variant="outline" className="text-[10px]">
                      {modelA.category}
                    </Badge>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Harga Input:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatCurrency(modelA.inputPricePerM)} / 1M
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Harga Output:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatCurrency(modelA.outputPricePerM)} / 1M
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Context Window:</span>
                    <span className="font-mono">
                      {modelA.contextWindow.toLocaleString("id-ID")} token
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 block mb-0.5">
                      Rekomendasi:
                    </span>
                    <p className="text-slate-700 italic">
                      &ldquo;{modelA.bestFor}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Model B Selector & Card */}
            <div className="rounded-xl border p-4 space-y-3 bg-slate-50/60">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Model Pilihan Kedua (B):
                </Label>
                <Select value={modelBId} onValueChange={setModelBId}>
                  <SelectTrigger className="h-9 text-xs bg-white font-medium">
                    <SelectValue placeholder="Pilih Model B" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeModels.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="text-xs">
                        {m.displayName} ({m.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {modelB && (
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Kategori:</span>
                    <Badge variant="outline" className="text-[10px]">
                      {modelB.category}
                    </Badge>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Harga Input:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatCurrency(modelB.inputPricePerM)} / 1M
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Harga Output:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatCurrency(modelB.outputPricePerM)} / 1M
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Context Window:</span>
                    <span className="font-mono">
                      {modelB.contextWindow.toLocaleString("id-ID")} token
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 block mb-0.5">
                      Rekomendasi:
                    </span>
                    <p className="text-slate-700 italic">
                      &ldquo;{modelB.bestFor}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Cost Simulator Slider */}
      <Card className="border shadow-xs bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-600" />
            Kalkulator Simulasi Estimasi Biaya Bulanan
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Geser parameter beban kerja harian Anda untuk melihat proyeksi biaya
            bulanan (30 hari kerja) secara transparan.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sliders Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Daily requests */}
            <div className="space-y-2 rounded-lg border bg-white p-3.5 shadow-2xs">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">
                  Permintaan / Hari
                </span>
                <span className="font-mono font-bold text-indigo-600 text-sm">
                  {dailyRequests.toLocaleString("id-ID")} req
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="3000"
                step="10"
                value={dailyRequests}
                onChange={(e) => setDailyRequests(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10 req</span>
                <span>1,500</span>
                <span>3,000 req</span>
              </div>
            </div>

            {/* Prompt tokens */}
            <div className="space-y-2 rounded-lg border bg-white p-3.5 shadow-2xs">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">
                  Rata-rata Prompt
                </span>
                <span className="font-mono font-bold text-indigo-600 text-sm">
                  {avgPromptTokens.toLocaleString("id-ID")} tokens
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="8000"
                step="100"
                value={avgPromptTokens}
                onChange={(e) => setAvgPromptTokens(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>200 tokens</span>
                <span>4,000</span>
                <span>8,000 tokens</span>
              </div>
            </div>

            {/* Completion tokens */}
            <div className="space-y-2 rounded-lg border bg-white p-3.5 shadow-2xs">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">
                  Rata-rata Completion
                </span>
                <span className="font-mono font-bold text-indigo-600 text-sm">
                  {avgCompletionTokens.toLocaleString("id-ID")} tokens
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={avgCompletionTokens}
                onChange={(e) => setAvgCompletionTokens(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>50 tokens</span>
                <span>1,500</span>
                <span>3,000 tokens</span>
              </div>
            </div>
          </div>

          {/* Results Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl border border-indigo-100 bg-white p-4 space-y-1 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Proyeksi {modelA?.displayName || "Model A"}
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {formatCurrency(costA)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Estimasi untuk {dailyRequests * 30} panggilan per bulan
              </p>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-white p-4 space-y-1 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Proyeksi {modelB?.displayName || "Model B"}
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {formatCurrency(costB)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Estimasi untuk {dailyRequests * 30} panggilan per bulan
              </p>
            </div>
          </div>

          {/* Savings Callout Banner */}
          {costDiff > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-600 text-white p-2 shrink-0">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Penghematan Potensial: {formatCurrency(costDiff)} / bulan (
                    {savingsPercent}%)
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Memilih <strong>{lowerModel}</strong> dibanding{" "}
                    <strong>{higherModel}</strong> menghemat pengeluaran hingga{" "}
                    {savingsPercent}% untuk beban kerja yang sama.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
