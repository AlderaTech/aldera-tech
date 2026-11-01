import type { ActivityLog, Project } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { cn, formatDate } from "@/lib/utils";
import emptyIllustration from "@/public/images/about/technology/design.webp";
import styles from "./overview.module.css";
import activityStyles from "./overview-activity.module.css";
import { OverviewActivityDialog } from "./overview-activity-dialog";

type OverviewActivityItem = Pick<
  ActivityLog,
  "id" | "description" | "createdAt"
> & {
  project: Pick<Project, "id" | "title"> | null;
};

const PREVIEW_LIMIT = 2;

export function OverviewActivity({
  recent,
}: {
  recent: OverviewActivityItem[];
}) {
  const previewItems = recent.slice(0, PREVIEW_LIMIT);

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
          <Image
            src={emptyIllustration}
            alt=""
            aria-hidden="true"
            width={96}
            height={96}
            sizes="96px"
            className={styles.emptyArt}
          />
          <div className={styles.emptyCopy}>
            <h3>Belum ada aktivitas.</h3>
            <p>Update proyek dan kolaborasi Anda akan tampil di sini.</p>
            <Link href={DASHBOARD_ROUTES.projects} className={styles.textLink}>
              Lihat Proyek Saya <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : (
        <div className={activityStyles.contentWrap}>
          <ol className={activityStyles.timeline}>
            {previewItems.map((activity) => (
              <li key={activity.id} className={activityStyles.item}>
                <span className={activityStyles.marker}>
                  <Activity aria-hidden="true" />
                </span>
                <div className={activityStyles.copy}>
                  <p>{activity.description}</p>
                  <div className={activityStyles.metaRow}>
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
                </div>
              </li>
            ))}
          </ol>

          <OverviewActivityDialog count={recent.length}>
            <ol className={activityStyles.modalList}>
              {recent.map((activity) => (
                <li key={activity.id} className={activityStyles.modalItem}>
                  <span
                    className={activityStyles.modalItemIcon}
                    aria-hidden="true"
                  >
                    <Activity />
                  </span>
                  <div className={activityStyles.modalItemCopy}>
                    <p>{activity.description}</p>
                    <div className={activityStyles.modalItemMeta}>
                      {activity.project && (
                        <span className={activityStyles.modalProjectBadge}>
                          {activity.project.title}
                        </span>
                      )}
                      <time dateTime={activity.createdAt.toISOString()}>
                        {formatDate(activity.createdAt, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  </div>
                  {activity.project && (
                    <Link
                      href={DASHBOARD_ROUTES.projectDetail(activity.project.id)}
                      className={cn(
                        styles.textLink,
                        activityStyles.modalItemAction
                      )}
                    >
                      Buka Proyek <ArrowRight aria-hidden="true" />
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </OverviewActivityDialog>
        </div>
      )}
    </aside>
  );
}
