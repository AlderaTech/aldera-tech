import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ReceiptText } from "lucide-react";
import {
  ADMIN_BANNER_CATEGORIES,
  type AdminBannerCategory,
} from "../_data/admin-banner-categories";
import { AdminBanner } from "./admin-banner";

describe("Kategori banner Admin", () => {
  for (const category of Object.keys(
    ADMIN_BANNER_CATEGORIES
  ) as AdminBannerCategory[]) {
    it("memakai label dan ikon konteks " + category, () => {
      const html = renderToStaticMarkup(
        <AdminBanner category={category}>
          <h1>Judul asli</h1>
          <p>Deskripsi asli</p>
        </AdminBanner>
      );
      expect(html).toContain(
        ADMIN_BANNER_CATEGORIES[category].label.replaceAll("&", "&amp;")
      );
      expect(html).toContain(`data-admin-category="${category}"`);
      expect(html.match(/<svg\b/g)).toHaveLength(1);
      expect(html).toContain("Judul asli");
      expect(html).not.toContain("Admin Console");
      expect(html).not.toContain("<button");
    });
  }
  it("meneruskan ikon, ID, visual dan tindakan kustom tanpa mengubah perilaku", () => {
    const html = renderToStaticMarkup(
      <AdminBanner
        category="projects"
        badgeIcon={ReceiptText}
        mascot={false}
        aria-labelledby="original-heading"
      >
        <h1 id="original-heading">Proyek</h1>
        <button disabled>Proyek Baru</button>
      </AdminBanner>
    );
    expect(html).toContain("lucide-receipt-text");
    expect(html).toContain('aria-labelledby="original-heading"');
    expect(html).toContain("disabled");
    expect(html).not.toContain("<img");
  });
});
