"use client";

import { useEffect, type RefObject } from "react";
import { getActiveTabScrollLeft } from "./active-tab-scroll";

export function useRevealActiveTab(
  ref: RefObject<HTMLDivElement | null>,
  activeTab: string
) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const list = root.matches("[data-workspace-tab-nav]")
      ? root
      : root.querySelector<HTMLElement>("[data-workspace-tab-nav]");
    if (!list) return;
    const reveal = () => {
      const active = list.querySelector<HTMLElement>('[data-state="active"]');
      if (!active) return;
      const viewport = list.getBoundingClientRect(),
        tab = active.getBoundingClientRect();
      const left = getActiveTabScrollLeft({
        scrollLeft: list.scrollLeft,
        viewportWidth: list.clientWidth,
        scrollWidth: list.scrollWidth,
        tabLeft: tab.left - viewport.left + list.scrollLeft,
        tabWidth: tab.width,
      });
      if (Math.abs(left - list.scrollLeft) > 1) list.scrollTo({ left });
    };
    reveal();
    const resize = new ResizeObserver(reveal);
    const changes = new MutationObserver(reveal);
    resize.observe(list);
    changes.observe(list, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    });
    return () => {
      resize.disconnect();
      changes.disconnect();
    };
  }, [ref, activeTab]);
}
