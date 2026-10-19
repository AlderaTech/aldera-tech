"use client";

import { Suspense, type ReactNode } from "react";
import { Tabs } from "@/components/ui/tabs";
import { useUrlState } from "@/lib/hooks/use-url-state";

export const VALID_PROJECT_TABS = [
  "timeline",
  "tasks",
  "activity",
  "messages",
  "files",
  "invoices",
] as const;

export type ProjectTabKey = (typeof VALID_PROJECT_TABS)[number];

export function isValidProjectTab(tab?: string | null): tab is ProjectTabKey {
  if (!tab) return false;
  return (VALID_PROJECT_TABS as readonly string[]).includes(tab);
}

export interface ProjectTabsProps {
  initialTab?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
}

function ProjectTabsInner({
  initialTab = "timeline",
  value,
  onValueChange,
  className,
  children,
}: ProjectTabsProps) {
  const { getParam, setParam } = useUrlState();
  const rawTab = value ?? getParam("tab", initialTab);
  const activeTab = isValidProjectTab(rawTab) ? rawTab : "timeline";

  const handleTabChange = (nextTab: string) => {
    if (onValueChange) {
      onValueChange(nextTab);
    } else {
      setParam("tab", nextTab);
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className={className}
    >
      {children}
    </Tabs>
  );
}

export function ProjectTabs(props: ProjectTabsProps) {
  const fallbackTab = isValidProjectTab(props.value ?? props.initialTab)
    ? (props.value ?? props.initialTab!)
    : "timeline";

  return (
    <Suspense
      fallback={
        <Tabs defaultValue={fallbackTab} className={props.className}>
          {props.children}
        </Tabs>
      }
    >
      <ProjectTabsInner {...props} />
    </Suspense>
  );
}
