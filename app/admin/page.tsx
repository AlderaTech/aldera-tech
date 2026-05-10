import { auth } from "@/auth";
import { AdminOverviewPage } from "./_components/overview/admin-overview-page";
import { getAdminOverviewData } from "./_data/overview";
import {
  getOperationalCards,
  getOverviewQuickActions,
  getOverviewStatCards,
} from "./_utils/overview-config";

export default async function AdminOverview() {
  const session = await auth();
  const { stats, recent, analytics } = await getAdminOverviewData();
  const role = session?.user.role;

  return (
    <AdminOverviewPage
      statCards={getOverviewStatCards(stats)}
      quickActions={getOverviewQuickActions(role)}
      operationalCards={getOperationalCards(role, stats)}
      analytics={analytics}
      recent={recent}
    />
  );
}
