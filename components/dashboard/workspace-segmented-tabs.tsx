"use client";

import { Children, type ComponentProps } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import styles from "./workspace-segmented-tabs.module.css";

export function WorkspaceTabsList({
  children,
  className,
  density,
  ...props
}: ComponentProps<typeof TabsList> & { density?: "compact" }) {
  return (
    <div className={styles.viewport} data-workspace-tabs>
      <TabsList
        {...props}
        className={cn(styles.list, className)}
        data-workspace-tab-nav
        data-density={density}
        data-tab-count={Children.count(children)}
      >
        {children}
      </TabsList>
    </div>
  );
}

export function WorkspaceTabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      {...props}
      className={cn(styles.trigger, className)}
      data-workspace-tab
    />
  );
}
