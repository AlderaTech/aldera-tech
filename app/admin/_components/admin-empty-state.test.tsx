import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminEmptyState } from "./admin-empty-state";
describe("Empty state admin", () => {
  it("menempatkan maskot dekoratif berukuran konsisten (empty tier) di atas teks dan mempertahankan tindakan", () => {
    const html = renderToStaticMarkup(
      <AdminEmptyState
        mascot
        title="Belum ada berkas"
        description="Unggah dari proyek terkait"
        action={<button>Proyek</button>}
      />
    );
    expect(html.indexOf("<img")).toBeLessThan(html.indexOf("<h3"));
    expect(html).toContain('alt=""');
    expect(html).toContain('data-admin-mascot="guide"');
    expect(html).toContain('data-admin-mascot-size="empty"');
    expect(html).toContain("aldera-profile-guide");
    expect(html).toContain(">Proyek<");
  });
  it("mendukung pose maskot kontekstual saat ditentukan", () => {
    const html = renderToStaticMarkup(
      <AdminEmptyState mascot pose="portfolio" title="Belum ada studi kasus" />
    );
    expect(html).toContain('data-admin-mascot="portfolio"');
    expect(html).toContain("aldera-cat-portfolio");
  });
  it("tidak memperbanyak maskot jika tidak diminta", () => {
    const html = renderToStaticMarkup(
      <AdminEmptyState title="Belum ada data" />
    );
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<button");
  });
});
