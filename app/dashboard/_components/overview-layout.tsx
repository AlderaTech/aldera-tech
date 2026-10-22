import type { ReactNode } from "react";
import styles from "./overview.module.css";

type OverviewLayoutProps = {
  welcome: ReactNode;
  stats: ReactNode;
  projects: ReactNode;
  onboarding: ReactNode;
  activity: ReactNode;
  empty: boolean;
};

export function OverviewLayout({
  welcome,
  stats,
  projects,
  onboarding,
  activity,
  empty,
}: OverviewLayoutProps) {
  return (
    <div className={styles.page}>
      {welcome}
      {stats}
      {onboarding}
      <div className={styles.columns} data-empty={empty || undefined}>
        {projects}
        {activity}
      </div>
    </div>
  );
}
