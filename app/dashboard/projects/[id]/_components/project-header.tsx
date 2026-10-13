import Link from "next/link";
import type { ProjectStatus } from "@prisma/client";
import { ArrowLeft, Calendar, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { projectStatusMeta } from "@/lib/status-meta";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DASHBOARD_ROUTES } from "@/lib/routes";

interface ProjectHeaderProps {
  title: string;
  status: ProjectStatus;
  description: string | null;
  deadline: Date | null;
  budget: unknown;
  progress: number;
}

export function ProjectHeader({
  title,
  status,
  description,
  deadline,
  budget,
  progress,
}: ProjectHeaderProps) {
  const meta = projectStatusMeta[status];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={DASHBOARD_ROUTES.projects}>
          <ArrowLeft className="size-4" /> Kembali
        </Link>
      </Button>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight xxxl:text-3xl">
            {title}
          </h1>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
        {description && (
          <p className="max-w-3xl text-muted-foreground">{description}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {deadline && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              Deadline: {formatDate(deadline)}
            </span>
          )}
          {budget != null && (
            <span className="inline-flex items-center gap-1">
              <Wallet className="size-3.5" />
              {formatCurrency(Number(budget))}
            </span>
          )}
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-medium">Progres Proyek</span>
          <span className="text-2xl font-bold tabular-nums">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </Card>
    </div>
  );
}
