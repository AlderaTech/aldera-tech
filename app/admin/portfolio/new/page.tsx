import { AdminMascot } from "../../_components/admin-mascot";
import { PortfolioForm } from "../_components/portfolio-form";

export default function NewPortfolioPage() {
  return (
    <div className="space-y-6">
      <div
        data-admin-page-header
        className="flex flex-wrap items-center justify-between gap-4"
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
        <AdminMascot pose="portfolio" size="header" />
      </div>
      <PortfolioForm />
    </div>
  );
}
