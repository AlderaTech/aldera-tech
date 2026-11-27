import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import AdminLoading from "./loading";
describe("Pemuatan admin", () => {
  it("mempertahankan layout lima statistik dan grafik tanpa nilai palsu", () => {
    const html = renderToStaticMarkup(<AdminLoading />);
    expect(html).toContain('aria-label="Memuat dashboard admin"');
    expect(html).toContain('role="status"');
    expect(html.match(/data-slot="card"/g)).toHaveLength(6);
    expect(html).not.toContain("Rp");
  });
});
