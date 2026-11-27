import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminFieldLabel } from "./admin-field-label";
describe("Label field admin", () => {
  it("menghubungkan label dan penanda wajib tanpa menambah validasi", () => {
    const html = renderToStaticMarkup(
      <AdminFieldLabel htmlFor="title" required>
        Judul proyek
      </AdminFieldLabel>
    );
    expect(html).toContain('for="title"');
    expect(html).toContain("text-destructive");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("*");
  });
  it("menandai pilihan opsional secara eksplisit", () => {
    expect(
      renderToStaticMarkup(<AdminFieldLabel optional>Budget</AdminFieldLabel>)
    ).toContain("(Opsional)");
  });
});
