import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { AdminStatCard } from "../admin-stat-card";
import type { getOverviewStatCards } from "../../_utils/overview-config";

type OverviewStat = ReturnType<typeof getOverviewStatCards>[number];

export function OverviewStatGrid({ stats }: { stats: OverviewStat[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <AdminStatCard
          key={stat.label}
          icon={stat.icon}
          label={stat.label}
          helper={stat.helper}
          toneClassName={stat.color}
          value={
            <AnimatedCounter
              value={stat.value}
              format={stat.isCurrency ? "currency" : "number"}
            />
          }
        />
      ))}
    </div>
  );
}
