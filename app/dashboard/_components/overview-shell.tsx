"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getStudioDashboardSection } from "@/components/dashboard/studio-dashboard-routes";
import { cn } from "@/lib/utils";
import styles from "@/components/dashboard/overview-chrome.module.css";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import overviewStyles from "./overview.module.css";

export function OverviewShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStudio = getStudioDashboardSection(pathname) !== null;
  const isOverview = pathname === DASHBOARD_ROUTES.home;

  return (
    <div
      data-overview-home={isOverview || undefined}
      className={cn(
        "flex min-h-svh bg-slate-50",
        isStudio && [styles.scope, styles.shell],
        isOverview && overviewStyles.overviewShell
      )}
    >
      {children}
    </div>
  );
}
