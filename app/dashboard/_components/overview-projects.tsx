import type { Project, Milestone } from "@prisma/client";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  FolderKanban,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { formatDate } from "@/lib/utils";
import { projectStatusMeta } from "@/lib/status-meta";
import styles from "./overview.module.css";
import projectStyles from "./overview-projects.module.css";

type OverviewProject = Pick<
  Project,
  "id" | "title" | "status" | "progress" | "updatedAt"
> & {
  milestones: Pick<Milestone, "title" | "dueDate">[];
};

export function OverviewProjects({
  projects,
}: {
  projects: OverviewProject[];
}) {
  return (
    <section
      className={styles.panel}
      aria-labelledby="overview-projects-heading"
    >
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Ruang kolaborasi</p>
          <h2 id="overview-projects-heading" className={styles.sectionTitle}>
            Proyek Terbaru
          </h2>
        </div>
        <Link href={DASHBOARD_ROUTES.projects} className={styles.textLink}>
          Semua <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <FolderKanban aria-hidden="true" />
          </span>
          <div className={styles.emptyCopy}>
            <h3>Belum ada proyek aktif.</h3>
            <p>Mulai dari kebutuhan Anda dan hitung estimasi proyek pertama.</p>
            <Link href={PUBLIC_ROUTES.calculator} className={styles.textLink}>
              Hitung Estimasi <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : (
        <div className={projectStyles.list}>
          {projects.map((project) => {
            const meta = projectStatusMeta[project.status];
            const nextMilestone = project.milestones[0];
            return (
              <Link
                key={project.id}
                href={DASHBOARD_ROUTES.projectDetail(project.id)}
                className={projectStyles.project}
              >
                <div className={projectStyles.top}>
                  <span className={projectStyles.projectIcon}>
                    <FolderKanban aria-hidden="true" />
                  </span>
                  <div className={projectStyles.heading}>
                    <h3>{project.title}</h3>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                  <ArrowUpRight
                    className={projectStyles.arrow}
                    aria-hidden="true"
                  />
                </div>
                {nextMilestone && (
                  <p className={projectStyles.milestone}>
                    Berikutnya: {nextMilestone.title}
                    {nextMilestone.dueDate &&
                      ` · ${formatDate(nextMilestone.dueDate)}`}
                  </p>
                )}
                <div className={projectStyles.progressLabel}>
                  <span>Progres proyek</span>
                  <strong>{project.progress}%</strong>
                </div>
                <progress
                  className={styles.progress}
                  value={project.progress}
                  max={100}
                  aria-label={`Progres ${project.title}`}
                >
                  {project.progress}%
                </progress>
                <p className={projectStyles.updated}>
                  <CalendarDays aria-hidden="true" />
                  <span>
                    Diperbarui{" "}
                    <time dateTime={project.updatedAt.toISOString()}>
                      {formatDate(project.updatedAt, {
                        day: "numeric",
                        month: "short",
                      })}
                    </time>
                  </span>
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
