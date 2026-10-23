import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { OverviewLayout } from "./overview-layout";

function render(empty: boolean, onboarding = <p>ONBOARDING</p>) {
  return renderToStaticMarkup(
    <OverviewLayout
      welcome={<p>WELCOME</p>}
      stats={<p>STATS</p>}
      projects={<p>PROJECTS</p>}
      onboarding={onboarding}
      activity={<p>ACTIVITY</p>}
      empty={empty}
    />
  );
}

describe("Susunan panel Ringkasan", () => {
  it("membatasi corak statis pada scope Ringkasan tanpa menghalangi pointer", () => {
    const css = readFileSync(
      new URL("./overview-patterns.module.css", import.meta.url),
      "utf8"
    );
    expect(css).toContain(".scope");
    for (const heading of [
      "overview-heading",
      "onboarding-heading",
      "overview-projects-heading",
      "overview-activity-heading",
    ])
      expect(css).toContain(`aria-labelledby="${heading}"`);
    expect(css).toContain('aria-label="Ringkasan statistik akun"');
    expect(css).toContain("pointer-events: none;");
    expect(css).toContain(".scope .welcomePattern::before");
    expect(css).not.toMatch(/:global|(?:^|\n)(?:body|html)\b|animation\s*:/);
  });

  it("menempatkan onboarding penuh sebelum baris proyek dan aktivitas", () => {
    const html = render(false);
    const positions = [
      "WELCOME",
      "STATS",
      "ONBOARDING",
      "PROJECTS",
      "ACTIVITY",
    ].map((text) => html.indexOf(text));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).not.toContain('data-empty="true"');
  });
  it("memprioritaskan onboarding pada keadaan kosong tanpa menggandakan panel", () => {
    const html = render(true);
    expect(html).toContain('data-empty="true"');
    expect(html.indexOf("ONBOARDING")).toBeLessThan(html.indexOf("PROJECTS"));
    for (const text of [
      "WELCOME",
      "STATS",
      "PROJECTS",
      "ONBOARDING",
      "ACTIVITY",
    ])
      expect(html.split(text)).toHaveLength(2);
  });
  it("tetap menampilkan proyek dan aktivitas setelah onboarding selesai", () => {
    const html = renderToStaticMarkup(
      <OverviewLayout
        welcome={null}
        stats={null}
        projects={<p>PROJECTS</p>}
        onboarding={null}
        activity={<p>ACTIVITY</p>}
        empty
      />
    );
    expect(html).toContain("PROJECTS");
    expect(html).toContain("ACTIVITY");
    expect(html).not.toContain("ONBOARDING");
  });
});
