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
    <div className="space-y-5">
      <OverviewHero actions={quickActions} />
      <OverviewStatGrid stats={statCards} />
      <OverviewCharts analytics={analytics} />
      <TopClientsCard clients={analytics.clientsData} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <RecentActivityCard activities={recent} />
        <OperationalPanel cards={operationalCards} actions={quickActions} />
      </div>
    </div>
  );
}
