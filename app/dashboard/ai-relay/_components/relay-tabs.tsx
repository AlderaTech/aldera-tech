"use client";

import { useEffect, useRef } from "react";
import {
  WorkspaceTabsList as TabsList,
  WorkspaceTabsTrigger as TabsTrigger,
} from "@/components/dashboard/workspace-segmented-tabs";
import { RELAY_SECTIONS } from "../_data/relay-sections";
import styles from "./relay-workspace.module.css";
import { useRevealActiveTab } from "@/lib/hooks/use-reveal-active-tab";

export function RelayTabs({ activeTab }: { activeTab: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousTab = useRef(activeTab);
  useRevealActiveTab(scrollRef, activeTab);

  useEffect(() => {
    const track = scrollRef.current;
    if (!track) return;
    if (previousTab.current !== activeTab) {
      const rect = track.getBoundingClientRect();
      const offset =
        Number.parseFloat(getComputedStyle(track).scrollMarginTop) || 0;
      if (rect.top < offset || rect.bottom > window.innerHeight) {
        track.scrollIntoView({ block: "start", inline: "nearest" });
      }
    }
    previousTab.current = activeTab;
  }, [activeTab]);

  return (
    <div ref={scrollRef} className={styles.tabScroll}>
      <TabsList aria-label="Fitur AI Relay" density="compact" overflow="scroll">
        {RELAY_SECTIONS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value}>
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
