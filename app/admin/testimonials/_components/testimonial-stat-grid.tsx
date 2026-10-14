import { Star, MessageSquare, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
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
      icon: MessageSquare,
      color: "text-brand-primary",
      bg: "bg-brand-primary/10",
    },
    {
      label: "Rata-rata Rating",
      value: `${avgRating} / 5.0`,
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Ditampilkan Publik",
      value: publishedCount,
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Menunggu Kurasi",
      value: moderationCount,
      icon: Clock,
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
