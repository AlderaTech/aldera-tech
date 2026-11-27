import type { ReactNode } from "react";
import { AdminBanner } from "./admin-banner";
import type { AdminBannerCategory } from "../_data/admin-banner-categories";
import { AdminMascot, type AdminMascotPose } from "./admin-mascot";
import styles from "./admin-common.module.css";

type AdminPageHeaderProps = {
  category: AdminBannerCategory;
  title: string;
  description?: string;
  actions?: ReactNode;
  mascot?: AdminMascotPose;
};
export function AdminPageHeader({
  category,
  title,
  description,
  actions,
  mascot,
}: AdminPageHeaderProps) {
  return (
    <AdminBanner
      category={category}
      mascot={mascot ? <AdminMascot pose={mascot} size="header" /> : undefined}
      data-admin-page-header
    >
      <div className={styles.headerCopy}>
        <h1>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </AdminBanner>
  );
}
