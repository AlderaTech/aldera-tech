import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { RELAY_SECTIONS } from "../_data/relay-sections";
import { RelaySectionHeading } from "./relay-section-heading";

describe("Hierarki panel AI Relay", () => {
  it("memberi setiap tab judul dan penjelasan tanpa kontrol baru", () => {
    for (const section of RELAY_SECTIONS) {
      const html = renderToStaticMarkup(
        <RelaySectionHeading tab={section.value} />
      );
      expect(html).toContain(
        `<h2>${section.label.replaceAll("&", "&amp;")}</h2>`
      );
      expect(html).toContain(section.description);
      expect(html).toContain("data-relay-section-heading");
      expect(html).toContain('aria-hidden="true"');
      expect(html).not.toMatch(/<(?:a|input|button)\b/);
    }
    expect(RelaySectionHeading({ tab: "unknown" })).toBeNull();
  });

  it("memisahkan kartu putih dan menjaga panel tab nonaktif tetap tersembunyi", () => {
    const css = readFileSync(
      new URL("./relay-workspace.module.css", import.meta.url),
      "utf8"
    );
    expect(css).toContain("var(--relay-ink) 18%");
    expect(css).toContain("var(--relay-ink) 72%");
    expect(css).toMatch(
      /\.sectionPanel\[data-state="inactive"\]\s*\{\s*display: none;/
    );
    const tabs = css.match(/\.workspace \.tabList\s*\{([^}]+)\}/)?.[1];
    expect(tabs).toContain("display: flex;");
    expect(tabs).toContain("flex-wrap: nowrap;");
    expect(tabs).toContain("width: max-content;");
    expect(css).toMatch(
      /\.sectionPanel\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\);/
    );
    expect(css).toMatch(/\.sectionPanel > \*\s*\{\s*min-width: 0;/);
    const panel = css.match(/\.sectionPanel\s*\{([^}]+)\}/)?.[1];
    expect(panel).toContain("background: transparent;");
    expect(panel).toContain("padding: 0;");
    expect(css).toContain("overflow-x: auto;");
    expect(css).toContain("prefers-reduced-motion");
    for (const line of css
      .split("\n")
      .filter((line) => line.includes(":global(body)"))) {
      expect(line).toContain(":has(.workspace)");
    }
  });

  it("menjaga tombol panjang dan maskot chat tetap utuh pada layar sempit", () => {
    const css = readFileSync(
      new URL("./relay-workspace.module.css", import.meta.url),
      "utf8"
    );
    expect(css).toContain("white-space: normal;");
    expect(css).toMatch(
      /\[class~="h-full"\]\s*\{\s*height: auto;\s*justify-content: flex-start;/
    );
    expect(css).not.toContain("min-width: 14rem;");
  });

  it("membatasi corak teknologi pada header dan sudut panel tanpa menghalangi kontrol", () => {
    const css = readFileSync(
      new URL("./relay-patterns.module.css", import.meta.url),
      "utf8"
    );
    for (const selector of [
      '[aria-labelledby="relay-heading"]::before',
      '[aria-labelledby="relay-heading"]::after',
      "[data-relay-balance-panel]::before",
      '[data-slot="card-header"]::after',
      "[data-relay-section-heading]::after",
    ]) {
      expect(css).toContain(`.scope ${selector}`);
    }
    expect(css).toContain("pointer-events: none;");
    expect(css).toContain("z-index: -1;");
    expect(css).toContain("mask-image:");
    expect(css).toContain("var(--relay-blue)");
    expect(css).toContain("repeating-linear-gradient");
    expect(css).toContain("@media (max-width: 639px)");
    expect(css).toMatch(
      /\[data-relay-section-heading\]::after\s*\{\s*display: none;/
    );
    expect(css).not.toMatch(
      /data-relay-chat|card-content|card-footer|pre\s*\{/
    );
    expect(css).not.toMatch(/:global|(?:^|\n)(?:body|html)\b|animation\s*:/);
    expect(css).not.toContain("dialog-content");
    expect(css).not.toContain("min-height:");
  });

  it("menjaga teks utama terbaca dan tiga kolom hanya pada area yang cukup lebar", () => {
    const css = readFileSync(
      new URL("./relay-workspace.module.css", import.meta.url),
      "utf8"
    );
    expect(css).toContain("--text-xs: 0.875rem;");
    expect(css).toContain("--text-sm: 0.9375rem;");
    expect(css).toContain("@container (min-width: 78rem)");
    expect(css).toContain("scroll-margin-top: 5.5rem;");
    const copyButton = css.match(
      /\[data-relay-model-card\] \[data-slot="card-header"\] button\s*\{([^}]+)\}/
    )?.[1];
    expect(copyButton).toContain("width: 2.75rem;");
    expect(copyButton).toContain("min-height: 2.75rem;");
  });

  it("memberi nominal top-up ruang yang cukup tanpa memecah angka pada HP", () => {
    const css = readFileSync(
      new URL("./relay-workspace.module.css", import.meta.url),
      "utf8"
    );
    const presets = css.match(
      /:has\(:global\(#custom-amount\)\)\s*\[class~="grid-cols-3"\]\s*\{([^}]+)\}/
    )?.[1];
    const amount = css.match(
      /:has\(:global\(#custom-amount\)\)\s*\[class~="grid-cols-3"\]\s*button\s*\{([^}]+)\}/
    )?.[1];
    expect(presets).toContain("repeat(auto-fit, minmax(7.25rem, 1fr))");
    expect(amount).toContain("white-space: nowrap;");
    expect(amount).toContain("overflow-wrap: normal;");
  });
});
