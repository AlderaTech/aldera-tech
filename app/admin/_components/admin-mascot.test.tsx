import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ADMIN_MASCOT_POSES,
  ADMIN_MASCOT_SIZES,
  AdminMascot,
  type AdminMascotPose,
  type AdminMascotSize,
} from "./admin-mascot";

describe("AdminMascot", () => {
  it("menyediakan seluruh pose kontekstual yang mengarah ke aset WebP valid dengan atribut dekoratif aksesibel", () => {
    const poses = Object.keys(ADMIN_MASCOT_POSES) as AdminMascotPose[];
    expect(poses.length).toBeGreaterThanOrEqual(12);

    for (const pose of poses) {
      const asset = ADMIN_MASCOT_POSES[pose];
      const filePath = resolve(
        process.cwd(),
        "public",
        asset.src.replace(/^\//, "")
      );
      expect(existsSync(filePath)).toBe(true);

      const html = renderToStaticMarkup(
        <AdminMascot pose={pose} size="header" />
      );
      expect(html).toContain(`data-admin-mascot="${pose}"`);
      expect(html).toContain('data-admin-mascot-size="header"');
      expect(html).toContain(`data-admin-mascot-aspect="${asset.aspect}"`);
      expect(html).toContain('alt=""');
      expect(html).toContain('aria-hidden="true"');
    }
  });

  it("menyeragamkan ukuran bingkai 1:1 (width === height) pada seluruh tier ukuran (hero, header, panel, empty)", () => {
    const sizes = Object.keys(ADMIN_MASCOT_SIZES) as AdminMascotSize[];
    expect(sizes).toEqual(["hero", "header", "panel", "empty"]);

    for (const size of sizes) {
      const spec = ADMIN_MASCOT_SIZES[size];
      expect(spec.width).toBe(spec.height);

      const html = renderToStaticMarkup(
        <AdminMascot pose="guide" size={size} />
      );
      expect(html).toContain(`data-admin-mascot-size="${size}"`);
      expect(html).toContain(`width="${spec.width}"`);
      expect(html).toContain(`height="${spec.height}"`);
    }
  });
});
