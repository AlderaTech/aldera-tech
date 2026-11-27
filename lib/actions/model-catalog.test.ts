import { describe, it, expect } from "bun:test";
describe("Authoritative model catalog", () => {
  it("returns an empty list or explicit error instead of an invented fallback catalog", () => {
    const script = `import {mock} from "bun:test";import assert from "node:assert/strict";
   let failed=false;
   mock.module("@/auth",()=>({auth:async()=>null}));
   mock.module("@/lib/router-db",()=>({queryRouter:async()=>{if(failed)throw new Error("fixture database failure");return {rows:[]};},transactionRouter:async()=>{throw new Error("not used");}}));
   const {getModelCatalog}=await import("./lib/actions/ai-relay.ts");
   assert.deepEqual(await getModelCatalog(),[]);failed=true;
   await assert.rejects(getModelCatalog(),/Katalog model belum dapat dimuat/);
  `;
    const child = Bun.spawnSync([process.execPath, "-e", script], {
      stdout: "pipe",
      stderr: "pipe",
    });
    if (child.exitCode !== 0) throw new Error(child.stderr.toString());
    expect(child.exitCode).toBe(0);
  });
});
