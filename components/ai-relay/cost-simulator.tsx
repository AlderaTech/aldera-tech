"use client";
import { Calculator, Sliders, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
import { formatCurrency } from "@/lib/utils";
import { useCostSimulator } from "./_hooks/use-cost-simulator";
import { ComparisonModelCard } from "./_components/comparison-model-card";
import { CostWorkloadControls } from "./_components/cost-workload-controls";

interface CostSimulatorProps {
  catalog: ModelCatalogItem[];
}

export function CostSimulator({ catalog }: CostSimulatorProps) {
  const {
    activeModels,
    modelAId,
    setModelAId,
    modelBId,
    setModelBId,
    dailyRequests,
    setDailyRequests,
    avgPromptTokens,
    setAvgPromptTokens,
    avgCompletionTokens,
    setAvgCompletionTokens,
    modelA,
    modelB,
    costA,
    costB,
    costDiff,
    higherModel,
    lowerModel,
    savingsPercent,
  } = useCostSimulator(catalog);

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
            <ComparisonModelCard
              label="Model Pilihan Pertama (A):"
              modelId={modelAId}
              onModelChange={setModelAId}
              activeModels={activeModels}
              model={modelA}
            />
            <ComparisonModelCard
              label="Model Pilihan Kedua (B):"
              placeholder="Pilih Model B"
              modelId={modelBId}
              onModelChange={setModelBId}
              activeModels={activeModels}
              model={modelB}
            />
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
          <CostWorkloadControls
            dailyRequests={dailyRequests}
            setDailyRequests={setDailyRequests}
            avgPromptTokens={avgPromptTokens}
            setAvgPromptTokens={setAvgPromptTokens}
            avgCompletionTokens={avgCompletionTokens}
            setAvgCompletionTokens={setAvgCompletionTokens}
          />

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
