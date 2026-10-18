import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, ChevronRight, Home, Receipt } from "lucide-react";
import { CalculatorWizard } from "@/app/(public)/pricing/_components/calculator-wizard";
import { getCalculatorData } from "@/lib/calculator";
import { getSiteSettings } from "@/lib/public-settings";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import styles from "./_components/calculator-page.module.css";

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
    <div className={styles.page}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
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
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            <Calculator aria-hidden="true" /> Rencanakan proyek Anda
          </p>
          <h1>Kalkulator Estimasi Proyek</h1>
          <p className={styles.description}>
            Rancang spesifikasi sistem, estimasikan biaya transparan, dan
            kirimkan order request langsung ke tim engineering Aldera Tech.
          </p>
        </div>
        <Link className={styles.history} href={DASHBOARD_ROUTES.orders}>
          <Receipt aria-hidden="true" /> Riwayat Estimasi
        </Link>
      </header>

      {/* Embedded In-Dashboard Calculator Wizard */}
      <CalculatorWizard
        data={calculatorData}
        isAuthenticated={true}
        whatsappNumber={siteSettings.whatsapp}
        appearance="dashboard"
      />
    </div>
  );
}
