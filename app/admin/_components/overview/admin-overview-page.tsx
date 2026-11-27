import { OperationalPanel } from "./operational-panel";
import { OverviewCharts } from "./overview-charts";
import { OverviewHero } from "./overview-hero";
import { OverviewStatGrid } from "./overview-stat-grid";
import { RecentActivityCard } from "./recent-activity-card";
import { TopClientsCard } from "./top-clients-card";
import type {
  getOperationalCards,
  getOverviewQuickActions,
  getOverviewStatCards,
} from "../../_utils/overview-config";
import type {
  AdminOverviewAnalytics,
  AdminRecentActivity,
} from "../../_data/overview";
import styles from "./admin-overview.module.css";

type AdminOverviewPageProps = {
  statCards: ReturnType<typeof getOverviewStatCards>;
  quickActions: ReturnType<typeof getOverviewQuickActions>;
  operationalCards: ReturnType<typeof getOperationalCards>;
  analytics: AdminOverviewAnalytics;
  recent: AdminRecentActivity[];
};

export function AdminOverviewPage({
  statCards,
  quickActions,
  operationalCards,
  analytics,
  recent,
}: AdminOverviewPageProps) {
  return (
    <div className={styles.workspace}>
      <OverviewHero actions={quickActions} />
      <OverviewStatGrid stats={statCards} />
      <OverviewCharts analytics={analytics} />
      <div className={styles.bottomGrid}>
        <TopClientsCard clients={analytics.clientsData} />
        <RecentActivityCard activities={recent} />
      </div>
      <OperationalPanel cards={operationalCards} actions={quickActions} />
    </div>
  );
}
