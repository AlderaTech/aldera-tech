import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ADMIN_ICON_ARTWORKS,
  ADMIN_ICON_ART_SIZES,
  AdminIconArt,
  resolveAdminIconArtwork,
  type AdminIconArtworkKey,
  type AdminIconArtSize,
} from "./admin-icon-art";

describe("AdminIconArt", () => {
  it("memastikan seluruh 15 aset ilustrasi 3D mengarah ke berkas WebP valid dan dirender aksesibel", () => {
    const keys = Object.keys(ADMIN_ICON_ARTWORKS) as AdminIconArtworkKey[];
    expect(keys.length).toBeGreaterThanOrEqual(15);

    for (const key of keys) {
      const src = ADMIN_ICON_ARTWORKS[key];
      const filePath = resolve(process.cwd(), "public", src.replace(/^\//, ""));
      expect(existsSync(filePath)).toBe(true);

      const html = renderToStaticMarkup(
        <AdminIconArt artwork={key} size="stat" />
      );
      expect(html).toContain(`data-admin-icon-art="${key}"`);
      expect(html).toContain('data-admin-icon-art-size="stat"');
      expect(html).toContain('alt=""');
      expect(html).toContain('aria-hidden="true"');
    }
  });

  it("memetakan label dan kategori kartu ke ilustrasi 3D yang sesuai secara kontekstual", () => {
    expect(resolveAdminIconArtwork("Mobile App Development")).toBe(
      "service-mobile"
    );
    expect(resolveAdminIconArtwork("E-Commerce & Payment")).toBe(
      "service-commerce"
    );
    expect(resolveAdminIconArtwork("Total Revenue")).toBe("service-seo");
    expect(resolveAdminIconArtwork("Fitur Kalkulator")).toBe("tech-ai");
    expect(resolveAdminIconArtwork("Opsi Add-On")).toBe("tech-cloud");
    expect(resolveAdminIconArtwork("Total Studi Kasus")).toBe("tech-design");
    expect(resolveAdminIconArtwork("Pengaturan Formula")).toBe("tech-backend");
  });

  it("menyeragamkan ukuran bingkai 1:1 pada seluruh tier ukuran (stat, item, sm)", () => {
    const sizes = Object.keys(ADMIN_ICON_ART_SIZES) as AdminIconArtSize[];
    expect(sizes).toEqual(["stat", "item", "sm"]);

    for (const size of sizes) {
      const spec = ADMIN_ICON_ART_SIZES[size];
      expect(spec.width).toBe(spec.height);

      const html = renderToStaticMarkup(
        <AdminIconArt artwork="tech-web" size={size} />
      );
      expect(html).toContain(`data-admin-icon-art-size="${size}"`);
      expect(html).toContain(`width="${spec.width}"`);
      expect(html).toContain(`height="${spec.height}"`);
    }
  });
});
