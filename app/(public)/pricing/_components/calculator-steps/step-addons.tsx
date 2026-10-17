"use client";

import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { AddOn, Config } from "../../_types/calculator";
import { CalculatorChoice } from "../calculator-choice";

type StepAddOnsProps = {
  availableAddOns: AddOn[];
  selectedAddOns: Record<string, number>;
  onAddOnChange: (addOnId: string, months: number) => void;
  urgency: "normal" | "urgent";
  onUrgencyChange: (urgency: "normal" | "urgent") => void;
  config: Config;
  onBack: () => void;
  onNext: () => void;
  studio?: boolean;
};

export function StepAddOns({
  availableAddOns,
  selectedAddOns,
  onAddOnChange,
  urgency,
  onUrgencyChange,
  config,
  onBack,
  onNext,
  studio = false,
}: StepAddOnsProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          4. Add-On & Urgensi Timeline
        </h3>
        <p className="text-sm text-muted-foreground">
          Pilih layanan pendukung pasca-rilis dan target kecepatan delivery.
        </p>
      </div>

      {availableAddOns.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Add-On Berkala (Opsional)
          </h4>
          {availableAddOns.map((ao) => (
            <div
              key={ao.id}
              className="space-y-2 rounded-lg border border-border bg-card p-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="text-sm font-medium text-foreground">
                  {ao.name}
                </span>
                <span className="text-xs font-semibold text-primary tabular-nums">
                  {formatCurrency(Number(ao.pricePerMonth))}/bulan
                </span>
              </div>
              {ao.description && (
                <p className="text-xs text-muted-foreground">
                  {ao.description}
                </p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Label
                  htmlFor={`addon-${ao.id}`}
                  className="text-xs text-muted-foreground"
                >
                  Durasi langganan:
                </Label>
                <Input
                  id={`addon-${ao.id}`}
                  type="number"
                  min={0}
                  max={ao.maxMonths}
                  className="h-8 w-20 text-center"
                  value={selectedAddOns[ao.id] || ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "" || Number(raw) === 0) {
                      onAddOnChange(ao.id, 0);
                      return;
                    }
                    const num = Number(raw);
                    const min = ao.minMonths || 1;
                    const max = ao.maxMonths;
                    const clamped = Math.min(Math.max(num, min), max);
                    onAddOnChange(ao.id, clamped);
                  }}
                  placeholder="0"
                />
                <span className="text-xs text-muted-foreground">
                  bulan ({ao.minMonths ? `min ${ao.minMonths}, ` : ""}maks{" "}
                  {ao.maxMonths} bulan)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Urgency */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">
          Timeline & Prioritas
        </h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <CalculatorChoice
            className={`cursor-pointer p-4 transition-all ${
              urgency === "normal"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border hover:bg-muted/30"
            }`}
            onSelect={() => onUrgencyChange("normal")}
            studio={studio}
            selected={urgency === "normal"}
          >
            <p className="font-semibold text-foreground">Standar (Normal)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Timeline sprint wajar sesuai cakupan fitur produk Anda.
            </p>
          </CalculatorChoice>

          <CalculatorChoice
            className={`cursor-pointer p-4 transition-all ${
              urgency === "urgent"
                ? "border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20"
                : "border-border hover:bg-muted/30"
            }`}
            onSelect={() => onUrgencyChange("urgent")}
            studio={studio}
            selected={urgency === "urgent"}
          >
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-amber-500" />
              <span className="font-semibold text-foreground">
                Prioritas Urgent
              </span>
              <Badge className="bg-amber-500 py-0 text-xs text-white hover:bg-amber-600">
                +
                {Math.round(
                  (Number(config?.urgencyMultiplier || 1.5) - 1) * 100
                )}
                %
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Alokasi tim dedikasi penuh untuk rilis cepat (&lt;
              {config?.urgencyThresholdDays || 14} hari).
            </p>
          </CalculatorChoice>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" /> Kembali
        </Button>
        <Button onClick={onNext} className="gap-2">
          Review & Ajukan <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
