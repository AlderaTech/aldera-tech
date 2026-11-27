import { Star, MessageSquare, CheckCircle, Clock } from "lucide-react";
import { AdminStatCard } from "../../_components/admin-stat-card";
import type { TestimonialItem } from "../_utils/testimonial-types";

export function TestimonialStatGrid({ items }: { items: TestimonialItem[] }) {
  const total = items.length;
  const publishedCount = items.filter((it) => it.published).length;
  const moderationCount = total - publishedCount;
  const avgRating =
    total > 0
      ? (items.reduce((sum, it) => sum + it.rating, 0) / total).toFixed(1)
      : "5.0";

  const stats = [
    {
      label: "Total Testimoni",
      value: total,
      helper: "Seluruh ulasan terdaftar",
      icon: MessageSquare,
      toneClassName: "text-primary bg-primary/10 border-primary/20",
    },
    {
      label: "Rata-rata Rating",
      value: `${avgRating} / 5.0`,
      helper: "Kepuasan klien rata-rata",
      icon: Star,
      toneClassName: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Ditampilkan Publik",
      value: publishedCount,
      helper: "Aktif di halaman publik",
      icon: CheckCircle,
      toneClassName: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Menunggu Kurasi",
      value: moderationCount,
      helper: "Perlu tinjauan admin",
      icon: Clock,
      toneClassName: "text-sky-600 bg-sky-500/10 border-sky-500/20",
    },
  ];

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-label="Statistik testimoni"
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
