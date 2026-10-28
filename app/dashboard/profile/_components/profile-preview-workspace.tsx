"use client";

import { ProfileProjectsPanel } from "./profile-projects-panel";
import { ProfilePaymentPanel } from "./profile-payment-panel";
import { ProfileActivityPanel } from "./profile-activity-panel";
import styles from "./profile-preview.module.css";

export function ProfilePreviewWorkspace() {
  return (
    <div className={styles.dashboardGrid}>
      <ProfileProjectsPanel />
      <aside
        className={styles.rightColumn}
        aria-label="Pembayaran dan aktivitas"
      >
        <ProfilePaymentPanel />
        <ProfileActivityPanel />
      </aside>
    </div>
  );
}
