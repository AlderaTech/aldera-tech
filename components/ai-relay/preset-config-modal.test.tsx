import { describe, expect, it } from "bun:test";
import { SITE_ORIGINS, RELAY_ORIGINS } from "@/lib/routes";

describe("IDE endpoint environment isolation", () => {
  for (const [site, endpoint] of [
    [SITE_ORIGINS.production, RELAY_ORIGINS.production],
    [SITE_ORIGINS.staging, RELAY_ORIGINS.staging],
  ]) {
    it(`uses ${endpoint} consistently in the public guide and IDE dialog`, () => {
      const script = `import {mock} from "bun:test";import assert from "node:assert/strict";import * as React from "react";import {renderToStaticMarkup} from "react-dom/server";
        process.env.NEXT_PUBLIC_APP_URL=${JSON.stringify(site)};
        const div=({children})=>React.createElement("div",null,children);
        mock.module("@/components/ui/dialog",()=>({Dialog:div,DialogContent:div,DialogHeader:div,DialogDescription:div,DialogTitle:div}));
        const {PresetConfigModal}=await import("./components/ai-relay/preset-config-modal.tsx");
        const {RELAY_BASE_URL}=await import("./app/(public)/ai-relay/_data/relay-content.ts");
        assert.equal(RELAY_BASE_URL,${JSON.stringify(endpoint)});
        const html=renderToStaticMarkup(React.createElement(PresetConfigModal,{isOpen:true,onClose:()=>{},modelId:"fixture-model",activeApiKeys:[]}));
        assert.ok(html.includes(${JSON.stringify(endpoint + "/v1")}));assert.ok(html.includes("fixture-model"));assert.ok(!html.includes("aldera.tech/api/relay"));
      `;
      const result = Bun.spawnSync([process.execPath, "-e", script]);
      if (result.exitCode) throw new Error(result.stderr.toString());
      expect(result.exitCode).toBe(0);
    });
  }
});
