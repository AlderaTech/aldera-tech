"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import type { Config, Feature } from "../../_types/calculator";

type StepFeaturesProps = {
  availableFeatures: Feature[];
  selectedFeatures: string[];
  onToggleFeature: (id: string, selected: boolean) => void;
  customFeatures: { name: string; description: string }[];
  onCustomFeaturesChange: (
    features: { name: string; description: string }[]
  ) => void;
  config: Config;
  onBack: () => void;
  onNext: () => void;
};

export function StepFeatures({
  availableFeatures,
  selectedFeatures,
  onToggleFeature,
  customFeatures,
  onCustomFeaturesChange,
  config,
  onBack,
  onNext,
}: StepFeaturesProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          3. Pilih Fitur & Modul
        </h3>
        <p className="text-sm text-muted-foreground">
          Pilih modul fungsional yang ingin dibangun dalam produk digital Anda.
        </p>
      </div>

      {config?.featureDisclaimer && (
        <div className="flex gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed whitespace-pre-line">
            {config.featureDisclaimer}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {availableFeatures.map((f) => {
          const isChecked = selectedFeatures.includes(f.id);
          return (
            <label
              key={f.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                isChecked
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) =>
                  onToggleFeature(f.id, Boolean(checked))
                }
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {f.name}
                  </span>
                  {f.isMajor && (
                    <Badge className="gap-1 bg-amber-500 px-1.5 py-0 text-[10px] text-white hover:bg-amber-600">
                      <Star className="size-2.5 fill-white" /> Major
                    </Badge>
                  )}
                  <span className="ml-auto text-sm font-semibold text-primary tabular-nums">
                    {formatCurrency(Number(f.price))}
                  </span>
                </div>
                {f.disclaimer && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {f.disclaimer}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Custom features */}
      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Fitur Custom
          </h4>
          <p className="text-xs text-muted-foreground">
            Butuh integrasi atau alur unik yang belum ada di daftar di atas?
            Tambahkan di sini.
          </p>
        </div>

        {customFeatures.map((cf, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder="Nama fitur spesifik (misal: Integrasi IoT Dashboard)"
              value={cf.name}
              onChange={(e) => {
                const arr = [...customFeatures];
                arr[i] = { ...arr[i], name: e.target.value };
                onCustomFeaturesChange(arr);
              }}
              className="text-sm"
            />
            <Button
              size="icon"
              variant="ghost"
              aria-label="Hapus fitur custom"
              onClick={() =>
                onCustomFeaturesChange(customFeatures.filter((_, j) => j !== i))
              }
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}

        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            onCustomFeaturesChange([
              ...customFeatures,
              { name: "", description: "" },
            ])
          }
          disabled={customFeatures.length >= 10}
          className="gap-1.5"
        >
          <Plus className="size-4" /> Tambah Fitur Kustom
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" /> Kembali
        </Button>
        <Button onClick={onNext} className="gap-2">
          Pilih Add-On <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
