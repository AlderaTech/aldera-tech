import { PieChart, TrendingUp } from "lucide-react";

import {
  ProjectStatusPie,
  RevenueAreaChart,
} from "@/components/dashboard/analytics-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminOverviewAnalytics } from "../../_data/overview";

export function OverviewCharts({
  analytics,
}: {
  analytics: AdminOverviewAnalytics;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4" />
            Revenue 12 Bulan Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueAreaChart data={analytics.revenueSeries} />
        </CardContent>
      </Card>
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChart className="size-4" />
            Status Proyek
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectStatusPie data={analytics.statusData} />
        </CardContent>
      </Card>
    </div>
  );
}
