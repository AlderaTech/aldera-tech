import type { MilestoneStatus } from "@prisma/client";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  X,
} from "lucide-react";

import { MilestoneApproval } from "@/components/dashboard/milestone-approval";
import { StaggerContainer, StaggerItem } from "@/components/shared/motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { milestoneStatusMeta } from "@/lib/status-meta";
import { formatDate } from "@/lib/utils";

const milestoneIcon = {
  PENDING: Circle,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle2,
  BLOCKED: AlertCircle,
} as const;

export interface ProjectMilestoneItem {
  id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  dueDate: Date | null;
  completedAt: Date | null;
  requiresClientApproval: boolean;
  clientApprovedAt: Date | null;
  clientRejectedAt: Date | null;
  clientFeedback: string | null;
}

interface ProjectTimelineTabProps {
  milestones: ProjectMilestoneItem[];
}

export function ProjectTimelineTab({ milestones }: ProjectTimelineTabProps) {
  if (milestones.length === 0) {
    return (
      <Card className="p-10 text-center text-muted-foreground">
        Belum ada milestone.
      </Card>
    );
  }

  return (
    <StaggerContainer>
      <ol className="relative ml-3 space-y-5 border-l-2">
        {milestones.map((m) => {
          const mMeta = milestoneStatusMeta[m.status];
          const Icon = milestoneIcon[m.status];
          return (
            <StaggerItem key={m.id}>
              <li className="relative pl-6">
                <span
                  className={`absolute top-1 -left-[13px] flex size-6 items-center justify-center rounded-full ring-4 ring-background ${
                    m.status === "COMPLETED"
                      ? "bg-success text-success-foreground"
                      : m.status === "IN_PROGRESS"
                        ? "bg-primary text-primary-foreground"
                        : m.status === "BLOCKED"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                </span>
                <Card className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{m.title}</h3>
                        <Badge variant={mMeta.variant}>{mMeta.label}</Badge>
                      </div>
                      {m.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {m.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {m.dueDate && (
                          <span>Deadline: {formatDate(m.dueDate)}</span>
                        )}
                        {m.completedAt && (
                          <span className="text-success">
                            Selesai: {formatDate(m.completedAt)}
                          </span>
                        )}
                      </div>
                      {m.requiresClientApproval &&
                        m.status === "COMPLETED" &&
                        !m.clientApprovedAt &&
                        !m.clientRejectedAt && (
                          <MilestoneApproval milestoneId={m.id} />
                        )}
                      {m.clientApprovedAt && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-success">
                          <Check className="size-3.5 shrink-0" />
                          <span>
                            Disetujui {formatDate(m.clientApprovedAt)}
                          </span>
                        </p>
                      )}
                      {m.clientRejectedAt && (
                        <div className="mt-2 text-xs">
                          <p className="flex items-center gap-1 text-destructive">
                            <X className="size-3.5 shrink-0" />
                            <span>
                              Ditolak {formatDate(m.clientRejectedAt)}
                            </span>
                          </p>
                          {m.clientFeedback && (
                            <p className="mt-1 text-muted-foreground">
                              Feedback: {m.clientFeedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </li>
            </StaggerItem>
          );
        })}
      </ol>
    </StaggerContainer>
  );
}
