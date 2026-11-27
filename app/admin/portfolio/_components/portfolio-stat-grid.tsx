import { Briefcase, Eye, EyeOff, Layers } from "lucide-react";
import { AdminStatCard } from "../../_components/admin-stat-card";
import type { PortfolioCaseStudyItem } from "../_utils/portfolio-types";

export function PortfolioStatGrid({
  items,
}: {
  items: PortfolioCaseStudyItem[];
}) {
  const total = items.length;
  const publishedCount = items.filter((it) => it.published).length;
  const draftCount = total - publishedCount;
  const industriesCount = new Set(
    items.map((it) => it.industry.toLowerCase().trim())
  ).size;

  const stats = [
    {
      label: "Total Studi Kasus",
      value: total,
      helper: "Seluruh karya di database",
      icon: Briefcase,
      toneClassName: "text-primary bg-primary/10 border-primary/20",
    },
    {
      label: "Dipublikasikan",
      value: publishedCount,
      helper: "Tampil di website publik",
      icon: Eye,
      toneClassName: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Draft",
      value: draftCount,
      helper: "Menunggu publikasi",
      icon: EyeOff,
      toneClassName: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Sektor Industri",
      value: industriesCount,
      helper: "Kategori industri unik",
      icon: Layers,
      toneClassName: "text-sky-600 bg-sky-500/10 border-sky-500/20",
    },
  ];

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-label="Statistik portfolio"
    >
      {stats.map((s) => (
        <AdminStatCard
          key={s.label}
          icon={s.icon}
          label={s.label}
          value={s.value}
          helper={s.helper}
          toneClassName={s.toneClassName}
        />
      ))}
    </div>
  );
}
