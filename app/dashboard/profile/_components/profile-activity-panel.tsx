"use client";

import { ProfileMascot } from "./profile-mascot";
import {
  Activity,
  ChartNoAxesCombined,
  CircleCheck,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  PROFILE_PREVIEW_ACTIVITIES,
  PROFILE_PREVIEW_LIMITS,
} from "../_data/profile-preview-data";
import type {
  PreviewActivity,
  PreviewResource,
} from "../_types/profile-preview";
import {
  PreviewFeedback,
  PreviewPanelHeader,
} from "./profile-preview-primitives";
import styles from "./profile-preview.module.css";

const initial: PreviewResource<PreviewActivity> = {
  status: "ready",
  items: PROFILE_PREVIEW_ACTIVITIES,
};
const icons = {
  progress: ChartNoAxesCombined,
  document: FileText,
  status: CircleCheck,
};

export function ProfileActivityPanel({
  resource = initial,
  onRetry,
}: {
  resource?: PreviewResource<PreviewActivity>;
  onRetry?: () => void;
}) {
  const activities =
    resource.status === "ready"
      ? resource.items.slice(0, PROFILE_PREVIEW_LIMITS.activities)
      : [];
  return (
    <section
      className={styles.panel}
      aria-labelledby="profile-activity-heading"
    >
      <PreviewPanelHeader
        id="profile-activity-heading"
        title="Aktivitas Terbaru"
        icon={Activity}
        visual={
          <ProfileMascot variant="activity" className={styles.activityMascot} />
        }
      />
      <p className={styles.panelDescription}>
        Linimasa contoh. Riwayat aktivitas akun belum terhubung.
      </p>
      <div className={styles.activityContent}>
        {resource.status === "loading" ? (
          <PreviewFeedback status="loading" label="Memuat aktivitas demo" />
        ) : resource.status === "error" ? (
          <PreviewFeedback
            status="error"
            label="Aktivitas belum dapat ditampilkan"
            message={resource.message}
            onRetry={onRetry}
          />
        ) : activities.length === 0 ? (
          <PreviewFeedback status="empty" label="Belum ada aktivitas demo" />
        ) : (
          <ol className={styles.timeline}>
            {activities.map((activity) => {
              const Icon = icons[activity.kind];
              return (
                <li key={activity.id}>
                  <span className={styles.timelineIcon} aria-hidden="true">
                    <Icon size={17} />
                  </span>
                  <div>
                    <p>{activity.description}</p>
                    <time dateTime={activity.occurredAt}>
                      {formatDate(activity.occurredAt, {
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Jakarta",
                      })}{" "}
                      WIB
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {resource.status === "ready" &&
          resource.items.length > PROFILE_PREVIEW_LIMITS.activities && (
            <p className={styles.demoNote}>
              Menampilkan {activities.length} dari {resource.items.length}{" "}
              aktivitas contoh.
            </p>
          )}
      </div>
    </section>
  );
}
