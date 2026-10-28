"use client";

import { useEffect, useRef } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RELAY_SECTIONS } from "../_data/relay-sections";
import { getRelayTabScrollLeft } from "../_utils/relay-tab-scroll";
import styles from "./relay-workspace.module.css";

export function RelayTabs({ activeTab }: { activeTab: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousTab = useRef(activeTab);

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
    const revealActiveTab = () => {
      const active = track.querySelector<HTMLElement>('[data-state="active"]');
      if (!active) return;
      const trackRect = track.getBoundingClientRect();
      const tabRect = active.getBoundingClientRect();
      const left = getRelayTabScrollLeft({
        scrollLeft: track.scrollLeft,
        viewportWidth: track.clientWidth,
        scrollWidth: track.scrollWidth,
        tabLeft: tabRect.left - trackRect.left + track.scrollLeft,
        tabWidth: tabRect.width,
      });
      if (Math.abs(track.scrollLeft - left) > 1) track.scrollTo({ left });
    };
    revealActiveTab();
    const observer = new ResizeObserver(revealActiveTab);
    observer.observe(track);
    if (track.firstElementChild) observer.observe(track.firstElementChild);
    return () => observer.disconnect();
  }, [activeTab]);

  return (
    <div ref={scrollRef} className={styles.tabScroll}>
      <TabsList aria-label="Fitur AI Relay" className={styles.tabList}>
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
