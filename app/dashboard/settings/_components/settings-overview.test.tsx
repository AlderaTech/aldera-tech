import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { SettingsOverview } from "./settings-overview";

describe("SettingsOverview", () => {
  it("memisahkan ketersediaan notifikasi dan pengelolaan informasi akun", () => {
    const html = renderToStaticMarkup(<SettingsOverview />);
    expect(html).toContain('aria-labelledby="notifications-title"');
    expect(html).toContain('id="notifications-title">Notifikasi</h2>');
    expect(html).toContain('aria-labelledby="account-title"');
    expect(html).toContain('id="account-title"');
    expect(html).toContain("nama lengkap dan nomor telepon");
    expect(html).toContain(
      "Belum ada preferensi notifikasi yang dapat diubah di halaman ini."
    );
  });

  it("menjadikan mini maskot dekoratif tanpa kontrol tambahan", () => {
    const html = renderToStaticMarkup(<SettingsOverview />);
    expect(html.match(/<img\b/g)).toHaveLength(1);
    expect(html).toContain('alt=""');
    expect(html).toContain('sizes="112px"');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain("tabindex=");
    expect(html).not.toMatch(/<button\b/);
  });

  it("mendahulukan tautan Profil dan hanya menjelaskan field yang tersedia", () => {
    const html = renderToStaticMarkup(<SettingsOverview />);
    expect(html.indexOf('aria-labelledby="account-title"')).toBeLessThan(
      html.indexOf('aria-labelledby="notifications-title"')
    );
    expect(html).toContain(
      'aria-label="Informasi yang dapat dikelola di Profil"'
    );
    expect(html.match(/<li\b/g)).toHaveLength(2);
    expect(html).toContain("Nama lengkap</h3>");
    expect(html).toContain("Nomor telepon</h3>");
    expect(html).not.toContain("Workspace Anda");
  });

  it("membatasi tema dan corak pada halaman serta menjaga fokus dan gerakan", () => {
    const css = readFileSync(
      new URL("./settings.module.css", import.meta.url),
      "utf8"
    );
    expect(css).toContain("container-type: inline-size;");
    expect(css).toContain("@container (min-width: 54rem)");
    expect(css).toContain("font-size: 0.875rem;");
    expect(css).toContain("var(--overview-ink) 18%");
    expect(css).toContain("var(--overview-ink) 72%");
    expect(css).toContain("pointer-events: none;");
    expect(css).toContain("z-index: -1;");
    expect(css).toContain(".page .profileLink:focus-visible");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).not.toMatch(/:global|(?:^|\n)(?:body|html)\s*\{/);
    const panel = css.match(/\.panel\s*\{([^}]+)\}/)?.[1];
    expect(panel).toContain("background: var(--overview-paper);");
    expect(panel).not.toMatch(/(?:min-)?height:/);
  });
});
