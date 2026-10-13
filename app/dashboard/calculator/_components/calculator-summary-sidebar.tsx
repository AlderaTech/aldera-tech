"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
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
}: Props) {
  return (
    <div className="h-fit lg:sticky lg:top-24">
      <Card className="space-y-3 p-5">
        <h3 className="font-semibold">Estimasi Harga</h3>
        {pt && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Base ({pt.name})</span>
              <span>{formatCurrency(Number(pt.basePrice))}</span>
            </div>
            {depFields.map((f) =>
              depValues[f.label] ? (
                <div key={f.label} className="flex justify-between">
                  <span>
                    {f.label} ({depValues[f.label]} {f.unit})
                  </span>
                  <span>
                    {formatCurrency(depValues[f.label] * f.pricePerUnit)}
                  </span>
                </div>
              ) : null
            )}
            {selectedFeatures.map((fId) => {
              const f = features.find((x) => x.id === fId);
              return f ? (
                <div key={fId} className="flex justify-between">
                  <span className="mr-2 truncate">{f.name}</span>
                  <span className="shrink-0">
                    {formatCurrency(Number(f.price))}
                  </span>
                </div>
              ) : null;
            })}
            {customFeatures
              .filter((c) => c.name)
              .map((c, i) => (
                <div key={i} className="flex justify-between">
                  <span className="mr-2 truncate">{c.name}</span>
                  <span className="shrink-0">
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
                    <span>
                      {ao.name} ({months} bln)
                    </span>
                    <span>
                      {formatCurrency(Number(ao.pricePerMonth) * months)}
                    </span>
                  </div>
                ) : null;
              })}
            {urgency === "urgent" && (
              <div className="flex justify-between text-amber-600">
                <span>
                  Urgent (+
                  {Math.round(
                    (Number(config?.urgencyMultiplier || 1.5) - 1) * 100
                  )}
                  %)
                </span>
                <span>×{config?.urgencyMultiplier || 1.5}</span>
              </div>
            )}
          </div>
        )}
        <div className="border-t pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          {config?.dpPercentage ? (
            <div className="mt-2 flex justify-between border-t border-dashed pt-2 text-sm">
              <span>DP ({config.dpPercentage}%)</span>
              <span className="font-semibold">
                {formatCurrency(
                  Math.round((total * config.dpPercentage) / 100)
                )}
              </span>
            </div>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            *Harga estimasi, final setelah review tim
          </p>
        </div>
      </Card>
    </div>
  );
}
