import { PortfolioForm } from "../_components/portfolio-form";

export default function NewPortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Tambah Studi Kasus
        </h1>
        <p className="text-muted-foreground">
          Dokumentasikan tantangan, solusi teknik, dan hasil bisnis proyek untuk
          portofolio publik.
        </p>
      </div>
      <PortfolioForm />
    </div>
  );
}
