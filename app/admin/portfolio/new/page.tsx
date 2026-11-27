import { AdminBanner } from "@/app/admin/_components/admin-banner";
import { AdminMascot } from "../../_components/admin-mascot";
import { PortfolioForm } from "../_components/portfolio-form";

export default function NewPortfolioPage() {
  return (
    <div className="space-y-6">
      <AdminBanner
        data-admin-page-header
        className="flex flex-wrap items-center justify-between gap-4"
        category="content"
        mascot={<AdminMascot pose="portfolio" size="header" />}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tambah Studi Kasus
          </h1>
          <p className="text-muted-foreground">
            Dokumentasikan tantangan, solusi teknik, dan hasil bisnis proyek
            untuk portofolio publik.
          </p>
        </div>
      </AdminBanner>
      <PortfolioForm />
    </div>
  );
}
