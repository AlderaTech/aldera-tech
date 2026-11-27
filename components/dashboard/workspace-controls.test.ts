import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");
describe("Kontrak visual workspace bersama", () => {
  it("menggunakan tinggi header yang sama untuk chrome dan tab sticky", () => {
    const chrome = read("./overview-chrome.module.css");
    const layout = read("./workspace-layout.module.css");
    const admin = read("../../app/admin/_components/admin-chrome.module.css");
    const tabs = read(
      "../../app/admin/projects/[id]/_components/project-detail-tabs.tsx"
    );
    expect(chrome).toContain("--workspace-header-height: 4rem");
    expect(admin).toContain("height: var(--workspace-header-height)");
    expect(layout).toContain("top: var(--workspace-header-height)");
    expect(tabs).not.toContain("sticky top-16");
  });
  it("membatasi pastel status, kontrol dan portal ke scope workspace", () => {
    const css = read("./workspace-controls.module.css");
    for (const variant of [
      "default",
      "secondary",
      "warning",
      "success",
      "destructive",
    ])
      expect(css).toContain('data-variant="' + variant + '"');
    for (const slot of [
      "button",
      "select-trigger",
      "select-content",
      "dropdown-menu-content",
      "dropdown-menu-item",
      "dialog-content",
    ])
      expect(css).toContain('data-slot="' + slot + '"');
    expect(css).not.toMatch(/(?:^|\n)(?:body|html|button|input)\s*\{/);
    expect(css).toContain("prefers-reduced-motion");
  });
  it("menjaga corak kartu tetap sama ketika urutan data berubah", () => {
    const css = read("../../app/admin/_components/admin-surfaces.module.css");
    expect(css).not.toContain("nth-child(4n");
    expect(css).toContain("--card-pattern-accent: var(--overview-blue)");
  });
});
