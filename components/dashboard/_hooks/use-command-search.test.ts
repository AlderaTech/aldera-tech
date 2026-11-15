import { describe, expect, it } from "bun:test";

describe("Command search feedback", () => {
  for (const outcome of ["success", "empty", "failure", "abort"]) {
    it(`handles ${outcome} without retaining stale search results`, () => {
      const script = `import {mock} from "bun:test";import assert from "node:assert/strict";
        const updates=[];let slot=0,cleanup;const values=[[],false,null,0];
        let notified=0;mock.module("sonner",()=>({toast:{error:()=>{notified++;}}}));
        mock.module("react",()=>({useState:()=>{const index=slot++;return[values[index],v=>updates.push({index,value:v})];},useEffect:fn=>{cleanup=fn();}}));
        const outcome=${JSON.stringify(outcome)};let url;
        globalThis.fetch=async value=>{url=value;if(outcome==="failure")return new Response("down",{status:503});return Response.json({results:outcome==="success"?[{id:"fixture"}]:[]});};
        const {useCommandSearch}=await import("./components/dashboard/_hooks/use-command-search.ts");
        const hook=useCommandSearch("a & b",true);if(outcome==="abort")cleanup();
        await new Promise(resolve=>setTimeout(resolve,260));
        if(outcome!=="abort")assert.ok(url.endsWith("q=a%20%26%20b"));
        if(outcome==="failure")assert.ok(updates.some(u=>u.index===2&&typeof u.value==="string"));
        else assert.ok(!updates.some(u=>u.index===2&&typeof u.value==="string"));
        if(outcome==="success")assert.ok(updates.some(u=>u.index===0&&u.value?.[0]?.id==="fixture"));
        assert.equal(notified,outcome==="failure"?1:0);
        hook.retry();assert.ok(updates.some(u=>u.index===3&&u.value(0)===1));cleanup();
      `;
      const result = Bun.spawnSync([process.execPath, "-e", script]);
      if (result.exitCode) throw new Error(result.stderr.toString());
      expect(result.exitCode).toBe(0);
    });
  }
});
