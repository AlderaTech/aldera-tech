import type { MilestoneStatus } from "@prisma/client";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  X,
} from "lucide-react";

import { MilestoneApproval } from "@/components/dashboard/milestone-approval";
import { Badge } from "@/components/ui/badge";
import { milestoneStatusMeta } from "@/lib/status-meta";
import { formatDate } from "@/lib/utils";
import styles from "./project-detail.module.css";

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
  return (
    <section
      className={styles.panel}
      aria-labelledby="project-timeline-heading"
    >
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>
            <Flag className="size-3.5" aria-hidden="true" /> Tahapan Pengerjaan
          </p>
          <h2 id="project-timeline-heading" className={styles.panelTitle}>
            Timeline &amp; Milestone Proyek
          </h2>
          <p className={styles.panelSubtitle}>
            Pantau capaian setiap tahapan pengerjaan dan berikan persetujuan
            milestone.
          </p>
        </div>
        <span className={styles.countBadge}>{milestones.length} Milestone</span>
      </div>

      {milestones.length === 0 ? (
        <div className={styles.emptyBox}>Belum ada milestone.</div>
      ) : (
        <ol className={styles.timelineList}>
          {milestones.map((m) => {
            const mMeta = milestoneStatusMeta[m.status];
            const Icon = milestoneIcon[m.status];
            return (
              <li key={m.id} className={styles.timelineItem}>
                <span
                  className={styles.timelineMarker}
                  data-status={m.status}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </span>
                <div className={styles.timelineCard}>
                  <div className={styles.timelineCardHeader}>
                    <h3>{m.title}</h3>
                    <Badge variant={mMeta.variant}>{mMeta.label}</Badge>
                  </div>
                  {m.description && (
                    <p className={styles.timelineCardDesc}>{m.description}</p>
                  )}
                  {(m.dueDate || m.completedAt) && (
                    <div className={styles.timelineMeta}>
                      {m.dueDate && (
                        <span>Deadline: {formatDate(m.dueDate)}</span>
                      )}
                      {m.completedAt && (
                        <span className={styles.completedMeta}>
                          Selesai: {formatDate(m.completedAt)}
                        </span>
                      )}
                    </div>
                  )}
                  {m.requiresClientApproval &&
                    m.status === "COMPLETED" &&
                    !m.clientApprovedAt &&
                    !m.clientRejectedAt && (
                      <MilestoneApproval milestoneId={m.id} />
                    )}
                  {m.clientApprovedAt && (
                    <p className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <Check className="size-3.5 shrink-0" />
                      <span>Disetujui {formatDate(m.clientApprovedAt)}</span>
                    </p>
                  )}
                  {m.clientRejectedAt && (
                    <div className="mt-2.5 text-xs">
                      <p className="flex items-center gap-1.5 font-semibold text-rose-700">
                        <X className="size-3.5 shrink-0" />
                        <span>Ditolak {formatDate(m.clientRejectedAt)}</span>
                      </p>
                      {m.clientFeedback && (
                        <p className="mt-1 text-slate-600">
                          Feedback: {m.clientFeedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
