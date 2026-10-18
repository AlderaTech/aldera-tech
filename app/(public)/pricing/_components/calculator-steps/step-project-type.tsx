"use client";

import {
  ArrowRight,
  Check,
  Code2,
  Layers,
  ShoppingBag,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { ProjectType } from "../../_types/calculator";
import { CalculatorChoice } from "../calculator-choice";

const PROJECT_ICONS: Record<string, LucideIcon> = {
  code2: Code2,
  smartphone: Smartphone,
  shoppingBag: ShoppingBag,
  layers: Layers,
};

type StepProjectTypeProps = {
  projectTypes: ProjectType[];
  selectedType: string;
  onSelectType: (id: string) => void;
  onNext: () => void;
  studio?: boolean;
  dashboard?: boolean;
};

export function StepProjectType({
  projectTypes,
  selectedType,
  onSelectType,
  onNext,
  studio = false,
  dashboard = false,
}: StepProjectTypeProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          1. Pilih Jenis Proyek
        </h3>
        <p className="text-sm text-muted-foreground">
          Pilih fondasi arsitektur produk yang sesuai dengan kebutuhan bisnis
          Anda.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {projectTypes.map((t) => {
          const isSelected = selectedType === t.id;
          const Icon = PROJECT_ICONS[t.icon] || Layers;
          return (
            <CalculatorChoice
              key={t.id}
              className={`cursor-pointer p-5 transition-all hover:border-primary/50 ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "hover:bg-muted/30"
              }`}
              onSelect={() => onSelectType(t.id)}
              studio={studio}
              dashboard={dashboard}
              selected={isSelected}
            >
              {dashboard && (
                <div data-choice-heading>
                  <span data-choice-icon>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span data-choice-state>
                    {isSelected ? (
                      <>
                        <Check className="size-3.5" aria-hidden="true" />{" "}
                        Terpilih
                      </>
                    ) : (
                      "Pilih jenis"
                    )}
                  </span>
                </div>
              )}
              <h4 className="font-semibold text-foreground">{t.name}</h4>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {t.description ||
                  "Solusi kustom dengan standar performa tinggi."}
              </p>
              <p className="mt-3 text-sm font-bold text-primary tabular-nums">
                Mulai dari {formatCurrency(Number(t.basePrice))}
              </p>
            </CalculatorChoice>
          );
        })}
      </div>

      {(studio || dashboard) && projectTypes.length === 0 && (
        <p className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          {dashboard
            ? "Pilihan jenis proyek belum tersedia. Silakan coba kembali nanti."
            : "Pilihan jenis proyek belum tersedia. Silakan hubungi tim melalui tautan konsultasi untuk mendiskusikan kebutuhan Anda."}
        </p>
      )}
      {dashboard && !selectedType && projectTypes.length > 0 && (
        <p id="project-type-help" data-field-help>
          Pilih satu jenis proyek untuk melanjutkan ke pengaturan skala.
        </p>
      )}

      <div className="pt-2">
        <Button
          onClick={onNext}
          disabled={!selectedType}
          aria-describedby={
            dashboard && !selectedType ? "project-type-help" : undefined
          }
          className="gap-2"
        >
          Lanjut ke Detail <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
