import { Users } from "lucide-react";

import { TopClientsBar } from "@/components/dashboard/analytics-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminOverviewAnalytics } from "../../_data/overview";

export function TopClientsCard({
  clients,
}: {
  clients: AdminOverviewAnalytics["clientsData"];
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-primary" />
              Top 5 Client by Revenue
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Ranking client berdasarkan invoice berstatus paid.
            </p>
          </div>
          <div className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {clients.length} client
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <TopClientsBar data={clients} />
      </CardContent>
    </Card>
  );
}
