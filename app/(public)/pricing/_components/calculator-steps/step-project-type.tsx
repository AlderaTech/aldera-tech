"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ProjectType } from "../../_types/calculator";

type StepProjectTypeProps = {
  projectTypes: ProjectType[];
  selectedType: string;
  onSelectType: (id: string) => void;
  onNext: () => void;
};

export function StepProjectType({
  projectTypes,
  selectedType,
  onSelectType,
  onNext,
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
          return (
            <Card
              key={t.id}
              className={`cursor-pointer p-5 transition-all hover:border-primary/50 ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "hover:bg-muted/30"
              }`}
              onClick={() => onSelectType(t.id)}
            >
              <h4 className="font-semibold text-foreground">{t.name}</h4>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {t.description ||
                  "Solusi kustom dengan standar performa tinggi."}
              </p>
              <p className="mt-3 text-sm font-bold text-primary tabular-nums">
                Mulai dari {formatCurrency(Number(t.basePrice))}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="pt-2">
        <Button onClick={onNext} disabled={!selectedType} className="gap-2">
          Lanjut ke Detail <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
