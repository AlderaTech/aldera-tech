import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, ChevronRight, Home, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CalculatorWizard } from "@/app/(public)/pricing/_components/calculator-wizard";
import { getCalculatorData } from "@/lib/calculator";
import { getSiteSettings } from "@/lib/public-settings";
import { DASHBOARD_ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Kalkulator Estimasi Proyek | Dashboard",
  description:
    "Hitung estimasi biaya proyek baru dan ajukan order request langsung di portal dashboard Aldera Tech.",
};

export default async function DashboardCalculatorPage() {
  const [calculatorData, siteSettings] = await Promise.all([
    getCalculatorData(),
    getSiteSettings(),
  ]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm"
      >
        <Link
          href={DASHBOARD_ROUTES.home}
          className="flex cursor-pointer items-center gap-1 transition-colors hover:text-foreground"
        >
          <Home className="size-3.5" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <Link
          href={DASHBOARD_ROUTES.orders}
          className="flex cursor-pointer items-center gap-1 transition-colors hover:text-foreground"
        >
          <Receipt className="size-3.5" />
          <span>Riwayat Estimasi</span>
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <span className="font-medium text-foreground">Kalkulator Estimasi</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calculator className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Kalkulator Estimasi Proyek
            </h1>
            <p className="text-sm text-muted-foreground">
              Rancang spesifikasi sistem, estimasikan biaya transparan, dan
              kirimkan order request langsung ke tim engineering Aldera Tech.
            </p>
          </div>
        </div>
      </div>

      {/* Embedded In-Dashboard Calculator Wizard */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <CalculatorWizard
            data={calculatorData}
            isAuthenticated={true}
            whatsappNumber={siteSettings.whatsapp}
          />
        </CardContent>
      </Card>
    </div>
  );
}
