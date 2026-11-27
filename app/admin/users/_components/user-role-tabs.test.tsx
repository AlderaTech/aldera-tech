import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { ADMIN_ROUTES } from "@/lib/routes";
import { UserRoleTabs } from "./user-role-tabs";

const counts = { all: 9, admin: 4, developer: 4, client: 4 };

describe("Pilihan peran pengguna terlihat dan dapat dinavigasi", () => {
  it("mempertahankan empat label, jumlah asli dan tautan filter dengan satu pilihan peran aktif", () => {
    for (const role of ["ALL", "ADMIN", "CLIENT"]) {
      const html = renderToStaticMarkup(
        <UserRoleTabs
          activeRole={role}
          activeView="table"
          counts={counts}
          canManageUsers
        />
      );
      expect(html).toContain("data-admin-user-filters");
      expect(html).toContain('aria-label="Filter peran pengguna"');
      expect(html).toContain('data-role-count="4"');
      expect(html.match(/aria-current="page"/g)).toHaveLength(1);
      for (const label of ["Semua", "Admin", "Developer &amp; Tim", "Client"])
        expect(html).toContain(label);
      expect(html).toContain(`href="${ADMIN_ROUTES.users}"`);
      expect(html).toContain(`href="${ADMIN_ROUTES.users}?role=CLIENT"`);
      expect(html).toContain(">9<");
      expect(html.match(/>4</g)).toHaveLength(3);
    }
  });
  it("mempertahankan pembatasan staf dan kedua tampilan tim beserta parameter URL", () => {
    for (const view of ["workload", "table"]) {
      const html = renderToStaticMarkup(
        <UserRoleTabs
          activeRole="DEVELOPER"
          activeView={view}
          counts={{ all: 0, admin: 0, developer: 0, client: 0 }}
          canManageUsers={false}
        />
      );
      expect(html).toContain('data-role-count="1"');
      expect(html).toContain('aria-label="Tampilan anggota tim"');
      expect(html).not.toContain("?role=ADMIN");
      expect(html).not.toContain("?role=CLIENT");
      expect(html).toContain("role=DEVELOPER&amp;view=" + view);
      expect(html.match(/aria-current="page"/g)).toHaveLength(2);
      expect(html).toContain(">0<");
    }
  });
  it("membatasi warna kontras, counter dan layout responsif pada komponen ini", () => {
    const css = readFileSync(
      new URL("./user-role-tabs.module.css", import.meta.url),
      "utf8"
    );
    expect(css).toContain('[data-admin-user-option][aria-current="page"]');
    expect(css).toContain("background: var(--overview-blue)");
    expect(css).toContain("color: var(--overview-paper)");
    expect(css).toContain("repeat(2, minmax(0, 1fr))");
    expect(css).toContain("prefers-reduced-motion");
    const html = renderToStaticMarkup(
      <UserRoleTabs
        activeRole="ALL"
        activeView="table"
        counts={{ ...counts, all: 123456789 }}
        canManageUsers
      />
    );
    expect(html).toContain("123456789");
  });
});
