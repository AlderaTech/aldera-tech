import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { ProfilePreviewWorkspace } from "./profile-preview-workspace";
describe("Susunan panel tambahan Profil", () => {
  it("menyejajarkan bagian bawah kolom desktop tanpa tinggi tetap atau memotong isi aktivitas", () => {
    const css = readFileSync(
      new URL("./profile-preview.module.css", import.meta.url),
      "utf8"
    );
    const desktop = css
      .split("@container (min-width: 54rem)")[1]
      ?.split("@media")[0];
    expect(desktop).toMatch(/\.dashboardGrid\s*\{[^}]*align-items:\s*stretch/);
    expect(desktop).toContain(
      "grid-template-rows: auto minmax(min-content, 1fr)"
    );
    expect(desktop).not.toMatch(/(?:^|[;{])\s*(?:height|max-height):/);
    expect(css).toMatch(
      /\.rightColumn\s*>\s*\.panel\s*\{\s*align-content: start/
    );
  });
  it("menempatkan proyek di kiri dan pembayaran serta aktivitas dalam kolom pendamping tanpa langganan", () => {
    const html = renderToStaticMarkup(<ProfilePreviewWorkspace />);
    const headings = [
      "Seluruh Proyek Saya",
      "Informasi Pembayaran",
      "Aktivitas Terbaru",
    ];
    for (const title of headings) expect(html).toContain(title);
    expect(html.match(/>Demo</g)).toHaveLength(3);
    expect(html).toContain('aria-label="Pembayaran dan aktivitas"');
    expect(html.indexOf("Seluruh Proyek Saya")).toBeLessThan(
      html.indexOf("<aside")
    );
    const side = html.slice(
      html.indexOf("<aside"),
      html.lastIndexOf("</aside>")
    );
    expect(side).toContain("Informasi Pembayaran");
    expect(side).toContain("Aktivitas Terbaru");
    expect(html).not.toContain("Paket / Langganan");
    expect(html).not.toContain("Lihat Pilihan Paket");
    expect(html).not.toContain("Studio Care");
  });
});
