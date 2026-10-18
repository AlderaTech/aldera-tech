import type { Project } from "@prisma/client";
import Link from "next/link";
import { FolderKanban, CalendarDays, Clock3, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { formatDate } from "@/lib/utils";
import { projectStatusMeta } from "@/lib/status-meta";
import commonStyles from "../../_components/overview.module.css";
import styles from "./project-list.module.css";

type ProjectCardData = Pick<
  Project,
  | "id"
  | "title"
  | "description"
  | "status"
  | "progress"
  | "deadline"
  | "updatedAt"
>;

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const meta = projectStatusMeta[project.status];

  return (
    <Link
      href={DASHBOARD_ROUTES.projectDetail(project.id)}
      className={styles.card}
      aria-label={`Buka detail proyek ${project.title}`}
    >
      <div className={styles.cardTop}>
        <span className={styles.projectIcon} aria-hidden="true">
          <FolderKanban />
        </span>
        <Badge
          variant={meta.variant}
          className={styles.status}
          data-status={project.status}
        >
          <span className={styles.statusDot} aria-hidden="true" />
          {meta.label}
        </Badge>
      </div>
      <h2 className={styles.projectTitle}>{project.title}</h2>
      <p className={styles.projectDescription}>{project.description}</p>
      <div className={styles.cardDetails}>
        <div className={styles.progressLabel}>
          <span>Progres</span>
          <strong>{project.progress}%</strong>
        </div>
        <progress
          value={project.progress}
          max={100}
          className={commonStyles.progress}
          aria-label={`Progres ${project.title}`}
        >
          {project.progress}%
        </progress>
        <dl className={styles.dates}>
          {project.deadline && (
            <div>
              <dt>
                <CalendarDays aria-hidden="true" />
                Deadline
              </dt>
              <dd>
                <time dateTime={project.deadline.toISOString()}>
                  {formatDate(project.deadline)}
                </time>
              </dd>
            </div>
          )}
          <div>
            <dt>
              <Clock3 aria-hidden="true" />
              Diperbarui
            </dt>
            <dd>
              <time dateTime={project.updatedAt.toISOString()}>
                {formatDate(project.updatedAt, {
                  day: "numeric",
                  month: "short",
                })}
              </time>
            </dd>
          </div>
        </dl>
        <div className={styles.cardFooter}>
          <span>Lihat Detail</span>
          <ArrowUpRight aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
