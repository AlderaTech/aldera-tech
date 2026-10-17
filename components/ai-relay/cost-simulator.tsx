"use client";

import { useState } from "react";
import { Calculator, Sliders, TrendingDown } from "lucide-react";
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
  const higherModel =
    costA >= costB ? modelA?.displayName : modelB?.displayName;
  const lowerModel = costA >= costB ? modelB?.displayName : modelA?.displayName;
  const higherCost = Math.max(costA, costB);
  const savingsPercent =
    higherCost > 0 ? Math.round((costDiff / higherCost) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Side-by-Side Model Comparison Tool */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Sliders className="h-5 w-5 text-indigo-600" />
            Komparasi Model Berdampingan (Side-by-Side)
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-muted-foreground">
            Bandingkan harga, batas konteks, dan kapabilitas antar model sebelum
            menentukan arsitektur relay Anda.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Model A Selector & Card */}
            <div className="space-y-3 rounded-xl border bg-slate-50/60 p-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Model Pilihan Pertama (A):
                </Label>
                <Select value={modelAId} onValueChange={setModelAId}>
                  <SelectTrigger className="h-9 bg-white text-xs font-medium">
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
                <div className="space-y-2 pt-1 text-xs">
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
                    <span className="mb-0.5 block text-slate-500">
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
            <div className="space-y-3 rounded-xl border bg-slate-50/60 p-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Model Pilihan Kedua (B):
                </Label>
                <Select value={modelBId} onValueChange={setModelBId}>
                  <SelectTrigger className="h-9 bg-white text-xs font-medium">
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
                <div className="space-y-2 pt-1 text-xs">
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
                    <span className="mb-0.5 block text-slate-500">
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
      <Card className="border bg-gradient-to-br from-white to-slate-50 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calculator className="h-5 w-5 text-emerald-600" />
            Kalkulator Simulasi Estimasi Biaya Bulanan
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-muted-foreground">
            Geser parameter beban kerja harian Anda untuk melihat proyeksi biaya
            bulanan (30 hari kerja) secara transparan.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sliders Area */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Daily requests */}
            <div className="space-y-2 rounded-lg border bg-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Permintaan / Hari
                </span>
                <span className="font-mono text-sm font-bold text-indigo-600">
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
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10 req</span>
                <span>1,500</span>
                <span>3,000 req</span>
              </div>
            </div>

            {/* Prompt tokens */}
            <div className="space-y-2 rounded-lg border bg-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Rata-rata Prompt
                </span>
                <span className="font-mono text-sm font-bold text-indigo-600">
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
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>200 tokens</span>
                <span>4,000</span>
                <span>8,000 tokens</span>
              </div>
            </div>

            {/* Completion tokens */}
            <div className="space-y-2 rounded-lg border bg-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Rata-rata Completion
                </span>
                <span className="font-mono text-sm font-bold text-indigo-600">
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
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>50 tokens</span>
                <span>1,500</span>
                <span>3,000 tokens</span>
              </div>
            </div>
          </div>

          {/* Results Comparison Grid */}
          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
            <div className="space-y-1 rounded-xl border border-indigo-100 bg-white p-4 shadow-2xs">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Proyeksi {modelA?.displayName || "Model A"}
              </span>
              <div className="font-mono text-2xl font-extrabold text-slate-900">
                {formatCurrency(costA)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Estimasi untuk {dailyRequests * 30} panggilan per bulan
              </p>
            </div>

            <div className="space-y-1 rounded-xl border border-indigo-100 bg-white p-4 shadow-2xs">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Proyeksi {modelB?.displayName || "Model B"}
              </span>
              <div className="font-mono text-2xl font-extrabold text-slate-900">
                {formatCurrency(costB)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Estimasi untuk {dailyRequests * 30} panggilan per bulan
              </p>
            </div>
          </div>

          {/* Savings Callout Banner */}
          {costDiff > 0 && (
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="shrink-0 rounded-full bg-emerald-600 p-2 text-white">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Penghematan Potensial: {formatCurrency(costDiff)} / bulan (
                    {savingsPercent}%)
                  </h4>
                  <p className="mt-0.5 text-xs text-emerald-800">
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
