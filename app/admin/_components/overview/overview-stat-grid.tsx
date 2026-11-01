import { formatCurrency } from "@/lib/utils";
import { AdminStatCard } from "../admin-stat-card";
import type { getOverviewStatCards } from "../../_utils/overview-config";
import styles from "./admin-overview.module.css";

type OverviewStat = ReturnType<typeof getOverviewStatCards>[number];
export function OverviewStatGrid({ stats }: { stats: OverviewStat[] }) {
  return (
    <div className={styles.statsGrid} aria-label="Statistik operasional">
      {stats.map((stat) => (
        <AdminStatCard
          key={stat.label}
          icon={stat.icon}
          label={stat.label}
          helper={stat.helper}
          toneClassName={stat.color}
          value={
            stat.isCurrency
              ? formatCurrency(stat.value)
              : stat.value.toLocaleString("id-ID")
          }
        />
      ))}
    </div>
  );
}
