import { describe, expect, it } from "bun:test";
import { SITE_ORIGINS } from "@/lib/routes";

describe("Root metadata deployment policy", () => {
  for (const site of [SITE_ORIGINS.production, SITE_ORIGINS.staging]) {
    it(`uses the correct indexing policy for ${site}`, () => {
      const script = `import {mock} from "bun:test";import assert from "node:assert/strict";
        process.env.NEXT_PUBLIC_APP_URL=${JSON.stringify(site)};
        mock.module("next/font/google",()=>({Geist:()=>({variable:"sans"}),Geist_Mono:()=>({variable:"mono"}),Plus_Jakarta_Sans:()=>({variable:"jakarta"})}));
        mock.module("@/lib/public-settings",()=>({getSiteSettings:async()=>({brandName:"Aldera Tech",seoTitle:"Fixture",seoDescription:"Fixture description"})}));
        const {generateMetadata}=await import("./app/layout.tsx");
        const metadata=await generateMetadata();assert.equal(metadata.robots.index,${site === SITE_ORIGINS.production});assert.equal(metadata.robots.follow,${site === SITE_ORIGINS.production});assert.equal(metadata.metadataBase.origin,${JSON.stringify(site)});
      `;
      const result = Bun.spawnSync([process.execPath, "-e", script]);
      if (result.exitCode) throw new Error(result.stderr.toString());
      expect(result.exitCode).toBe(0);
    });
  }
});
