import Link from "next/link";
import { Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_ROUTES } from "@/lib/routes";
import { formatDate } from "@/lib/utils";
import type { AdminRecentActivity } from "../../_data/overview";
import { AdminEmptyState } from "../admin-empty-state";

export function RecentActivityCard({
  activities,
}: {
  activities: AdminRecentActivity[];
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden border-slate-200/90 bg-white shadow-2xs">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900">
              <Activity className="size-4 text-primary" />
              Aktivitas Terbaru
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Riwayat perubahan terbaru dari proyek dan sistem.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            {activities.length} log
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-0">
        {activities.length === 0 ? (
          <AdminEmptyState title="Belum ada aktivitas." />
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {activities.slice(0, 6).map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-xs text-slate-500">
              <span>
                Menampilkan {Math.min(activities.length, 6)} aktivitas terbaru
              </span>
              <Link
                href={ADMIN_ROUTES.audit}
                className="font-semibold text-primary hover:underline"
              >
                Lihat Audit Log
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityRow({ activity }: { activity: AdminRecentActivity }) {
  return (
    <div className="grid gap-2.5 px-5 py-3 transition-colors hover:bg-slate-50/80 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="flex min-w-0 items-start gap-2.5">
        <div className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10">
          <span className="size-1.5 rounded-full bg-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs leading-relaxed font-medium text-slate-950">
            {activity.description}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-500">
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
      <div className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 sm:justify-self-end">
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
