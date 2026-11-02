import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import {
  dashboardTabsListClass,
  dashboardTabsTriggerClass,
} from "./dashboard-tabs";

describe("Gaya tab dashboard yang seragam", () => {
  it("memakai bar putih ber-border dan tab aktif biru dengan teks putih", () => {
    expect(dashboardTabsListClass).toContain("bg-white");
    expect(dashboardTabsListClass).toContain("border-slate-200/90");
    expect(dashboardTabsListClass).toContain("overflow-x-auto");
    expect(dashboardTabsTriggerClass).toContain(
      "data-[state=active]:bg-primary"
    );
    expect(dashboardTabsTriggerClass).toContain(
      "data-[state=active]:text-white"
    );
    expect(dashboardTabsTriggerClass).toContain("min-h-9");
  });

  it("selaras dengan ukuran ringkas tab AI Gateway / Relay", () => {
    const relayCss = readFileSync(
      new URL("./workspace-segmented-tabs.module.css", import.meta.url),
      "utf8"
    );
    const trigger = relayCss.match(
      /\.list \.trigger\[data-workspace-tab\]\s*\{([^}]+)\}/
    )?.[1];
    expect(trigger).toContain("min-height: 44px;");
    expect(trigger).toContain("border-radius: 0.6rem;");
    expect(trigger).toContain("font-size: 0.8125rem;");
    expect(dashboardTabsTriggerClass).toContain("rounded-[0.6rem]");
    expect(dashboardTabsTriggerClass).toContain("text-[0.8125rem]");
  });

  it("diterapkan pada seluruh tab halaman detail proyek", () => {
    const page = readFileSync(
      new URL("../../app/dashboard/projects/[id]/page.tsx", import.meta.url),
      "utf8"
    );
    expect(page).toContain("className={dashboardTabsListClass}");
    expect(page.match(/className=\{dashboardTabsTriggerClass\}/g)).toHaveLength(
      6
    );
  });
});
