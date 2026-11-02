import Link from "next/link";
import type { ProjectStatus } from "@prisma/client";
import { ArrowLeft, Calendar, FolderKanban, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { projectStatusMeta } from "@/lib/status-meta";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import styles from "./project-detail.module.css";
import { WorkspaceBanner } from "@/components/dashboard/workspace-banner";

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
    <WorkspaceBanner
      className={styles.headerCard}
      eyebrow="Ruang Kolaborasi Proyek"
      badgeIcon={FolderKanban}
      mascotPose="projects"
    >
      <div className="w-full min-w-0">
        <div className={styles.headerTop}>
          <Link href={DASHBOARD_ROUTES.projects} className={styles.backLink}>
            <ArrowLeft aria-hidden="true" /> Kembali ke Proyek Saya
          </Link>
        </div>

        <div className={styles.headerMain}>
          <div className={styles.titleBlock}>
            <div className={styles.titleRow}>
              <h1>{title}</h1>
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </div>
            {description && <p className={styles.description}>{description}</p>}
          </div>

          {(deadline || budget != null) && (
            <div className={styles.metaChips}>
              {deadline && (
                <span className={styles.metaChip}>
                  <Calendar aria-hidden="true" />
                  Deadline: {formatDate(deadline)}
                </span>
              )}
              {budget != null && (
                <span className={styles.metaChip}>
                  <Wallet aria-hidden="true" />
                  {formatCurrency(Number(budget))}
                </span>
              )}
            </div>
          )}
        </div>

        <div className={styles.progressBox}>
          <div className={styles.progressHeader}>
            <span>Progres Proyek</span>
            <strong>{progress}%</strong>
          </div>
          <progress
            className={styles.progressBar}
            value={progress}
            max={100}
            aria-label={`Progres ${title}`}
          >
            {progress}%
          </progress>
        </div>
      </div>
    </WorkspaceBanner>
  );
}
