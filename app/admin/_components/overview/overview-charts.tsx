import { PieChart, TrendingUp } from "lucide-react";

import {
  ProjectStatusPie,
  RevenueAreaChart,
} from "@/components/dashboard/analytics-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminOverviewAnalytics } from "../../_data/overview";
import { AdminEmptyState } from "../admin-empty-state";
import styles from "./admin-overview.module.css";

export function OverviewCharts({
  analytics,
}: {
  analytics: AdminOverviewAnalytics;
}) {
  return (
    <div className={styles.chartsGrid}>
      <Card className="overflow-hidden border-slate-200/90 bg-white shadow-2xs">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900">
            <TrendingUp className="size-4 text-primary" />
            Revenue 12 Bulan Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4.5">
          {analytics.revenueSeries.length > 0 ? (
            <RevenueAreaChart data={analytics.revenueSeries} animate={false} />
          ) : (
            <AdminEmptyState context="revenue" />
          )}
        </CardContent>
      </Card>
      <Card className="overflow-hidden border-slate-200/90 bg-white shadow-2xs">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900">
            <PieChart className="size-4 text-primary" />
            Status Proyek
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4.5">
          {analytics.statusData.some((item) => item.value > 0) ? (
            <ProjectStatusPie data={analytics.statusData} animate={false} />
          ) : (
            <AdminEmptyState context="projectStatus" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
