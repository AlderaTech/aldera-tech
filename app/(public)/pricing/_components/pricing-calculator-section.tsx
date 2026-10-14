import { Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CalculatorWizard } from "./calculator-wizard";
import type { CalculatorData } from "../_types/calculator";

type PricingCalculatorSectionProps = {
  data: CalculatorData;
  isAuthenticated: boolean;
  whatsappNumber?: string;
};

export function PricingCalculatorSection({
  data,
  isAuthenticated,
  whatsappNumber,
}: PricingCalculatorSectionProps) {
  return (
    <section
      id="calculator"
      className="scroll-mt-20 border-t border-border/40 bg-muted/20 py-20"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
          <Badge
            variant="outline"
            className="gap-1.5 border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary"
          >
            <Calculator className="size-3.5" />
            Simulasi Biaya Interaktif
          </Badge>
          <h2 className="font-serif text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Kalkulator Estimasi Proyek
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Sesuaikan jenis proyek, estimasi jumlah halaman, modul fitur, hingga
            layanan pemeliharaan berkala untuk mendapatkan estimasi investasi
            transparan secara langsung.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <CalculatorWizard
            data={data}
            isAuthenticated={isAuthenticated}
            whatsappNumber={whatsappNumber}
          />
        </div>
      </div>
    </section>
  );
}
