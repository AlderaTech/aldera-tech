import { Briefcase, Eye, EyeOff, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
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
      icon: Briefcase,
      color: "text-brand-primary",
      bg: "bg-brand-primary/10",
    },
    {
      label: "Dipublikasikan",
      value: publishedCount,
      icon: Eye,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Draft",
      value: draftCount,
      icon: EyeOff,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Sektor Industri",
      value: industriesCount,
      icon: Layers,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card
            key={s.label}
            className="flex items-center justify-between border p-4 shadow-sm"
          >
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight">
                {s.value}
              </p>
            </div>
            <div className={`rounded-lg p-2.5 ${s.bg}`}>
              <Icon className={`size-5 ${s.color}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
