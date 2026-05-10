import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Timer,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ADMIN_ROUTES } from "@/lib/routes";
import { projectStatusMeta } from "@/lib/status-meta";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import type { AdminProjectDetail } from "../_data/project-detail";
import { getProjectDetailStats } from "../_data/project-detail";

export function ProjectDetailHeader({
  project,
}: {
  project: AdminProjectDetail;
}) {
  const meta = projectStatusMeta[project.status];
  const stats = getProjectDetailStats(project);
  const summaryItems = [
    {
      label: "Milestone selesai",
      value: `${stats.completedMilestones}/${project.milestones.length}`,
      icon: CheckCircle2,
    },
    {
      label: "Task terbuka",
      value: stats.openTasks,
      icon: Clock3,
    },
    {
      label: "Diskusi aktif",
      value: stats.activeMessages.length,
      icon: MessageSquare,
    },
    {
      label: "Jam tercatat",
      value: stats.trackedHours > 0 ? stats.trackedHours.toFixed(1) : "0",
      icon: Timer,
    },
  ];

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link href={ADMIN_ROUTES.projects}>
                <ArrowLeft className="size-4" /> Kembali ke Proyek
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight xxxl:text-3xl">
                {project.title}
              </h1>
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                    {getInitials(project.client.name)}
                  </AvatarFallback>
                </Avatar>
                {project.client.name}
                {project.client.company && (
                  <span className="text-xs">({project.client.company})</span>
                )}
              </div>
              {project.deadline && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {formatDate(project.deadline)}
                </span>
              )}
              {project.budget && (
                <span className="inline-flex items-center gap-1">
                  <Wallet className="size-3.5" />
                  {formatCurrency(Number(project.budget))}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-medium text-slate-500">
                  {item.label}
                </div>
                <item.icon className="size-4 text-primary" />
              </div>
              <div className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium">Progres</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {project.progress}%
              </span>
            </div>
            <Progress value={project.progress} />
          </div>
        </div>
      </Card>
    </>
  );
}
