"use client";

import { Card } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import styles from "./pricing-calculator.module.css";
import type {
  ProjectType,
  Feature,
  AddOn,
  Config,
  DependentField,
} from "../_types/calculator";

type Props = {
  pt?: ProjectType;
  depFields: DependentField[];
  depValues: Record<string, number>;
  selectedFeatures: string[];
  features: Feature[];
  customFeatures: { name: string; description: string }[];
  selectedAddOns: Record<string, number>;
  addOns: AddOn[];
  urgency: "normal" | "urgent";
  config: Config;
  total: number;
  studio?: boolean;
};

export function CalculatorSummarySidebar({
  pt,
  depFields,
  depValues,
  selectedFeatures,
  features,
  customFeatures,
  selectedAddOns,
  addOns,
  urgency,
  config,
  total,
  studio = false,
}: Props) {
  return (
    <div className={cn("h-fit lg:sticky lg:top-24", studio && styles.summary)}>
      <Card
        className={cn(
          "space-y-3 border-border bg-card p-5 shadow-sm",
          studio && styles.summaryCard
        )}
      >
        <h3 className="font-semibold text-foreground">Estimasi Biaya</h3>
        {pt ? (
          <div
            className={cn("space-y-2 text-sm", studio && styles.summaryDetails)}
          >
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base ({pt.name})</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(Number(pt.basePrice))}
              </span>
            </div>
            {depFields.map((f) =>
              depValues[f.label] ? (
                <div key={f.label} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {f.label} ({depValues[f.label]} {f.unit})
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(depValues[f.label] * f.pricePerUnit)}
                  </span>
                </div>
              ) : null
            )}
            {selectedFeatures.map((fId) => {
              const f = features.find((x) => x.id === fId);
              return f ? (
                <div key={fId} className="flex justify-between">
                  <span className="mr-2 truncate text-muted-foreground">
                    {f.name}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatCurrency(Number(f.price))}
                  </span>
                </div>
              ) : null;
            })}
            {customFeatures
              .filter((c) => c.name)
              .map((c, i) => (
                <div key={i} className="flex justify-between">
                  <span className="mr-2 truncate text-muted-foreground">
                    {c.name}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatCurrency(
                      Number(features.find((f) => !f.isMajor)?.price || 500000)
                    )}
                  </span>
                </div>
              ))}
            {Object.entries(selectedAddOns)
              .filter(([, m]) => m > 0)
              .map(([id, months]) => {
                const ao = addOns.find((a) => a.id === id);
                return ao ? (
                  <div key={id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {ao.name} ({months} bln)
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(Number(ao.pricePerMonth) * months)}
                    </span>
                  </div>
                ) : null;
              })}
            {urgency === "urgent" && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400">
                <span>
                  Prioritas Urgent (+
                  {Math.round(
                    (Number(config?.urgencyMultiplier || 1.5) - 1) * 100
                  )}
                  %)
                </span>
                <span className="font-semibold tabular-nums">
                  ×{config?.urgencyMultiplier || 1.5}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Pilih jenis proyek pada langkah pertama untuk melihat rincian
            estimasi biaya secara otomatis.
          </p>
        )}
        <div className="border-t border-border pt-3">
          <div
            className={cn(
              "flex justify-between text-lg font-bold text-foreground",
              studio && styles.summaryTotal
            )}
          >
            <span>Total Estimasi</span>
            <span className="text-primary tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
          {config?.dpPercentage ? (
            <div className="mt-2 flex justify-between border-t border-dashed border-border pt-2 text-sm">
              <span className="text-muted-foreground">
                DP ({config.dpPercentage}%)
              </span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(
                  Math.round((total * config.dpPercentage) / 100)
                )}
              </span>
            </div>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            *Estimasi transparan, finalisasi ruang lingkup disesuaikan saat
            konsultasi tim.
          </p>
        </div>
      </Card>
    </div>
  );
}
