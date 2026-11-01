import type { ReactNode } from "react";
import { AdminMascot, type AdminMascotPose } from "./admin-mascot";
import styles from "./admin-common.module.css";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  mascot?: AdminMascotPose;
};
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  mascot,
}: AdminPageHeaderProps) {
  return (
    <header className={styles.pageHeader} data-admin-page-header>
      <div className={styles.headerCopy}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {(mascot || actions) && (
        <div className={styles.actions}>
          {mascot && <AdminMascot pose={mascot} size="header" />}
          {actions}
        </div>
      )}
    </header>
  );
}
