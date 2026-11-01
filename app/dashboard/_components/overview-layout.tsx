import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./overview.module.css";
import patternStyles from "./overview-patterns.module.css";

type OverviewLayoutProps = {
  welcome: ReactNode;
  stats: ReactNode;
  charts?: ReactNode;
  projects: ReactNode;
  onboarding: ReactNode;
  activity: ReactNode;
  empty: boolean;
};

export function OverviewLayout({
  welcome,
  stats,
  charts,
  projects,
  onboarding,
  activity,
  empty,
}: OverviewLayoutProps) {
  return (
    <div className={cn(styles.page, patternStyles.scope)}>
      {welcome}
      {stats}
      {charts}
      {onboarding}
      <div className={styles.columns} data-empty={empty || undefined}>
        {projects}
        {activity}
      </div>
    </div>
  );
}
