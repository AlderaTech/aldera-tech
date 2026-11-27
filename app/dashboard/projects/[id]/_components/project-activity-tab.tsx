import { Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";
import styles from "./project-detail.module.css";

export interface ProjectActivityItem {
  id: string;
  description: string;
  createdAt: Date;
  user: { name: string } | null;
}

interface ProjectActivityTabProps {
  activities: ProjectActivityItem[];
}

export function ProjectActivityTab({ activities }: ProjectActivityTabProps) {
  return (
    <section
      className={styles.panel}
      aria-labelledby="project-activity-heading"
    >
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>
            <Activity className="size-3.5" aria-hidden="true" /> Tetap Terhubung
          </p>
          <h2 id="project-activity-heading" className={styles.panelTitle}>
            Log Aktivitas Proyek
          </h2>
          <p className={styles.panelSubtitle}>
            Riwayat pembaruan terbaru dari pengerjaan proyek Anda.
          </p>
        </div>
        <span className={styles.countBadge}>{activities.length} Aktivitas</span>
      </div>

      {activities.length === 0 ? (
        <div className={styles.emptyBox}>Belum ada aktivitas.</div>
      ) : (
        <ol className={styles.timelineList}>
          {activities.map((a) => (
            <li key={a.id} className={styles.timelineItem}>
              <span
                className={styles.timelineMarker}
                data-status="IN_PROGRESS"
                aria-hidden="true"
              >
                <Activity className="size-4" />
              </span>
              <div className={styles.timelineCard}>
                <p className="m-0 text-sm font-semibold text-[#102651]">
                  {a.description}
                </p>
                <div className={styles.timelineMeta}>
                  {a.user?.name && <span>Oleh {a.user.name}</span>}
                  <time dateTime={a.createdAt.toISOString()}>
                    {formatDate(a.createdAt, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
