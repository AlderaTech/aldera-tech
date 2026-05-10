import Link from "next/link";
import { Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_ROUTES } from "@/lib/routes";
import { formatDate } from "@/lib/utils";
import type { AdminRecentActivity } from "../../_data/overview";

export function RecentActivityCard({
  activities,
}: {
  activities: AdminRecentActivity[];
}) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200 bg-slate-50/70 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-primary" />
              Aktivitas Terbaru
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Riwayat perubahan terbaru dari proyek dan sistem.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
            {activities.length} log
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada aktivitas.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.slice(0, 6).map((activity) => (
              <ActivityRow key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityRow({ activity }: { activity: AdminRecentActivity }) {
  return (
    <div className="grid gap-3 p-4 transition-colors hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10">
          <span className="size-2 rounded-full bg-primary" />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-medium text-slate-950">
            {activity.description}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500">
            <span>{activity.user.name}</span>
            {activity.project && (
              <>
                <span>•</span>
                <Link
                  href={ADMIN_ROUTES.projectDetail(activity.project.id)}
                  className="font-medium text-slate-700 underline-offset-2 hover:text-primary hover:underline"
                >
                  {activity.project.title}
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
      <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 sm:justify-self-end">
        {formatDate(activity.createdAt, {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
