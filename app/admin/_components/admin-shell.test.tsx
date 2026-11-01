import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminShell } from "./admin-shell";

describe("Scope admin", () => {
  it("membungkus seluruh rute tanpa mengganti isi", () => {
    const html = renderToStaticMarkup(
      <AdminShell>
        <p>Isi halaman asli</p>
      </AdminShell>
    );
    expect(html).toContain("data-admin-workspace");
    expect(html).toContain("Isi halaman asli");
  });
  it("membatasi tema portal dan membersihkan atribut serta kelas ketika keluar admin", () => {
    const source = readFileSync(
      new URL("./admin-shell.tsx", import.meta.url),
      "utf8"
    );
    expect(source).toContain('body.getAttribute("data-admin-studio")');
    expect(source).toContain('body.removeAttribute("data-admin-studio")');
    expect(source).toContain("body.classList.remove(...addedClasses)");
    const theme = readFileSync(
      new URL("./admin-surfaces.module.css", import.meta.url),
      "utf8"
    );
    expect(theme).not.toMatch(/(?:^|\n)(?:body|html|table|input|button)\s*\{/);
    expect(theme).toContain('data-slot="dialog-content"');
    expect(theme).toContain('data-state="inactive"');
    expect(theme).toContain("--card-pattern-accent");
    expect(theme).toContain('[data-slot="card"])::before');
    expect(theme).toContain('[data-slot="card"])::after');
    expect(theme).toContain("[data-admin-stat])::before");
    expect(theme).toContain('[data-slot="card-header"])::after');
  });
});
