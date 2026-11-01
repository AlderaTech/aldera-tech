import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { AdminMascot, type AdminMascotPose } from "./admin-mascot";
import styles from "./admin-common.module.css";

export function AdminEmptyState({
  title,
  description,
  action,
  mascot = false,
  pose = "guide",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  mascot?: boolean;
  pose?: AdminMascotPose;
}) {
  return (
    <div className={styles.empty} data-admin-empty>
      {mascot ? (
        <AdminMascot pose={pose} size="empty" />
      ) : (
        <Inbox size={26} aria-hidden="true" />
      )}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
