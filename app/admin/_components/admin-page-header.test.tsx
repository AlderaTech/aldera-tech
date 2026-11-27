import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminPageHeader } from "./admin-page-header";
describe("Header halaman admin", () => {
  it("mempertahankan judul, deskripsi, dan tindakan asli", () => {
    const html = renderToStaticMarkup(
      <AdminPageHeader
        category="billing"
        title="Invoice"
        description="Kelola tagihan"
        actions={<button>Invoice Baru</button>}
      />
    );
    expect(html).toContain("<h1>Invoice</h1>");
    expect(html).toContain("Kelola tagihan");
    expect(html).toContain("Invoice Baru");
    expect(html).toContain("KEUANGAN &amp; TAGIHAN");
    expect(html.match(/data-admin-page-header/g)).toHaveLength(1);
  });
  it("tidak membuat kontrol jika action tidak tersedia", () => {
    expect(
      renderToStaticMarkup(
        <AdminPageHeader category="audit" title="Audit Log" />
      )
    ).not.toContain("<button");
  });
});
