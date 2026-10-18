"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { DependentField, ProjectType } from "../../_types/calculator";

type StepDetailsProps = {
  pt?: ProjectType;
  depFields: DependentField[];
  depValues: Record<string, number>;
  onDepValueChange: (label: string, value: number) => void;
  onBack: () => void;
  onNext: () => void;
  dashboard?: boolean;
};

export function StepDetails({
  pt,
  depFields,
  depValues,
  onDepValueChange,
  onBack,
  onNext,
  dashboard = false,
}: StepDetailsProps) {
  const isInvalid =
    depFields.length > 0 &&
    depFields.some(
      (f) => !depValues[f.label] || depValues[f.label] < (f.min || 1)
    );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          2. Spesifikasi Skala {pt ? `(${pt.name})` : ""}
        </h3>
        <p className="text-sm text-muted-foreground">
          Tentukan parameter volume atau jumlah modul untuk jenis proyek ini.
        </p>
      </div>

      {depFields.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Tidak ada parameter jumlah tambahan untuk jenis proyek ini. Seluruh
          fitur inti sudah terhitung di base price.
        </div>
      ) : (
        <div className="space-y-4">
          {depFields.map((field) => (
            <div
              key={field.label}
              className="space-y-1.5"
              data-scale-field={dashboard || undefined}
            >
              <Label
                htmlFor={`field-${field.label}`}
                className="text-sm font-medium"
              >
                {field.label}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({formatCurrency(field.pricePerUnit)}/{field.unit})
                </span>
              </Label>
              <Input
                id={`field-${field.label}`}
                type="number"
                min={field.min || 1}
                max={field.max || 99}
                value={depValues[field.label] || ""}
                onChange={(e) =>
                  onDepValueChange(field.label, Number(e.target.value))
                }
                placeholder={`Jumlah ${field.unit} (misal ${field.min || 1})`}
                className="max-w-sm"
                aria-describedby={
                  dashboard
                    ? `field-${encodeURIComponent(field.label)}-help`
                    : undefined
                }
              />
              {dashboard && (
                <p
                  id={`field-${encodeURIComponent(field.label)}-help`}
                  data-field-help
                >
                  Minimal {field.min || 1} {field.unit}. Biaya dihitung dari
                  jumlah yang Anda masukkan.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {dashboard && isInvalid && (
        <p id="scale-validation" data-field-help role="status">
          Lengkapi jumlah sesuai minimum untuk melanjutkan ke pilihan fitur.
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" /> Kembali
        </Button>
        <Button
          onClick={onNext}
          disabled={isInvalid}
          aria-describedby={
            dashboard && isInvalid ? "scale-validation" : undefined
          }
          className="gap-2"
        >
          Pilih Fitur <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
