import { describe, expect, it } from "bun:test";
import robots from "./robots";
import config from "../next.config";
import { SITE_ORIGINS } from "@/lib/routes";

describe("Production and staging indexing", () => {
  it("blocks staging crawlers and sets noindex response headers", async () => {
    const saved = process.env.NEXT_PUBLIC_APP_URL;
    try {
      process.env.NEXT_PUBLIC_APP_URL = SITE_ORIGINS.staging;
      expect(robots()).toEqual({ rules: [{ userAgent: "*", disallow: "/" }] });
      expect(await config.headers?.()).toContainEqual({
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      });
      process.env.NEXT_PUBLIC_APP_URL = SITE_ORIGINS.production;
      expect(robots().sitemap).toBe(`${SITE_ORIGINS.production}/sitemap.xml`);
      expect(await config.headers?.()).toEqual([]);
    } finally {
      if (saved === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
      else process.env.NEXT_PUBLIC_APP_URL = saved;
    }
  });
});
