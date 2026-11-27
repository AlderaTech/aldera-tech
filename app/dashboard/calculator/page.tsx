import type { Metadata } from "next";
import Link from "next/link";
import { Receipt, Calculator, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceBanner } from "@/components/dashboard/workspace-banner";
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
      <WorkspaceBanner
        className={styles.header}
        eyebrow="Rencanakan proyek"
        badgeIcon={Calculator}
        mascotPose="calculator"
      >
        <div>
          <h1>Kalkulator Estimasi Proyek</h1>
          <p className={styles.description}>
            Rancang spesifikasi sistem, estimasikan biaya transparan, dan
            kirimkan order request langsung ke tim engineering Aldera Tech.
          </p>
        </div>
        <Button asChild className={styles.history}>
          <Link href={DASHBOARD_ROUTES.orders}>
            <Receipt aria-hidden="true" /> Riwayat Estimasi
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
      </WorkspaceBanner>

      <CalculatorWizard
        data={calculatorData}
        isAuthenticated={true}
        whatsappNumber={siteSettings.whatsapp}
        appearance="dashboard"
      />
    </div>
  );
}
