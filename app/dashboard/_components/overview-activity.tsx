import type { ActivityLog, Project } from "@prisma/client";
import Link from "next/link";
import { Activity, Clock3, ArrowRight } from "lucide-react";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { formatDate } from "@/lib/utils";
import styles from "./overview.module.css";
import activityStyles from "./overview-activity.module.css";

type OverviewActivityItem = Pick<
  ActivityLog,
  "id" | "description" | "createdAt"
> & {
  project: Pick<Project, "id" | "title"> | null;
};

export function OverviewActivity({
  recent,
}: {
  recent: OverviewActivityItem[];
}) {
  return (
    <aside className={styles.panel} aria-labelledby="overview-activity-heading">
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Tetap terhubung</p>
          <h2 id="overview-activity-heading" className={styles.sectionTitle}>
            Aktivitas
          </h2>
        </div>
        <span className={activityStyles.headingIcon}>
          <Activity aria-hidden="true" />
        </span>
      </div>
      <p className={activityStyles.intro}>
        Perkembangan terbaru dari proyek Anda.
      </p>
      {recent.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <Clock3 aria-hidden="true" />
          </span>
          <h3>Belum ada aktivitas.</h3>
          <p>Update proyek dan kolaborasi Anda akan tampil di sini.</p>
          <Link href={DASHBOARD_ROUTES.projects} className={styles.textLink}>
            Lihat Proyek Saya <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <ol className={activityStyles.timeline}>
          {recent.map((activity) => (
            <li key={activity.id} className={activityStyles.item}>
              <span className={activityStyles.marker}>
                <Activity aria-hidden="true" />
              </span>
              <div className={activityStyles.copy}>
                <p>{activity.description}</p>
                {activity.project && (
                  <span className={activityStyles.project}>
                    {activity.project.title}
                  </span>
                )}
                <time dateTime={activity.createdAt.toISOString()}>
                  {formatDate(activity.createdAt, {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
