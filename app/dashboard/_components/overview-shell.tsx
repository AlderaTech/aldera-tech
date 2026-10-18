"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getStudioDashboardSection } from "@/components/dashboard/studio-dashboard-routes";
import { cn } from "@/lib/utils";
import styles from "@/components/dashboard/overview-chrome.module.css";

export function OverviewShell({ children }: { children: ReactNode }) {
  const isStudio = getStudioDashboardSection(usePathname()) !== null;

  return (
    <div
      className={cn(
        "flex min-h-svh bg-slate-50",
        isStudio && [styles.scope, styles.shell]
      )}
    >
      {children}
    </div>
  );
}
