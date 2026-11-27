import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ProfileMascot } from "./profile-mascot";
describe("Maskot Profil asli dalam pose baru", () => {
  for (const variant of ["guide", "activity"] as const) {
    it(`memuat aset ${variant} transparan yang terpisah dan tetap dekoratif`, async () => {
      const html = renderToStaticMarkup(
        <ProfileMascot variant={variant} className="local-slot" />
      );
      expect(html).toContain(`data-profile-mascot="${variant}"`);
      expect(html).toContain("local-slot");
      expect(html).toContain('alt=""');
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain(`aldera-profile-${variant}.webp`);
      const metadata = await sharp(
        fileURLToPath(
          new URL(
            `../../../../public/images/dashboard/profile/aldera-profile-${variant}.webp`,
            import.meta.url
          )
        )
      ).metadata();
      expect(metadata.hasAlpha).toBe(true);
      expect(metadata.width).toBeGreaterThan(128);
    });
  }
  it("mempertahankan proporsi gambar, tidak menghalangi klik, serta mendukung reduced motion", () => {
    const css = readFileSync(
      new URL("./profile-mascot.module.css", import.meta.url),
      "utf8"
    );
    expect(css).toContain("object-fit: contain");
    expect(css).toContain("pointer-events: none");
    expect(css).toContain("prefers-reduced-motion: no-preference");
  });
});
