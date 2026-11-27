import { describe, expect, it } from "bun:test";

describe("Search API permission and failure states", () => {
  it("separates service errors from empty results without leaking database details", () => {
    const script = `import {mock} from "bun:test";import assert from "node:assert/strict";import {NextRequest} from "next/server";
      let user=null,fail=false,calls=[];
      mock.module("@/auth",()=>({auth:async()=>user?{user}:null}));
      const findMany=async args=>{calls.push(args);if(fail)throw Error("private database details");return [];};
      mock.module("@/lib/prisma",()=>({prisma:{project:{findMany},invoice:{findMany},user:{findMany},blogPost:{findMany}}}));
      const {GET}=await import("./app/api/search/route.ts");
      const request=q=>new NextRequest("http://localhost/api/search?q="+encodeURIComponent(q));
      assert.equal((await GET(request("test"))).status,401);assert.equal(calls.length,0);
      user={id:"fixture",roles:["CLIENT"],role:"CLIENT"};
      let response=await GET(request(""));assert.equal(response.status,200);assert.equal(calls.length,0);
      response=await GET(request("test"));assert.deepEqual(await response.json(),{results:[]});
      assert.ok(calls.every(c=>c.where.clientId==="fixture"&&c.take===5));
      fail=true;console.error=()=>{};response=await GET(request("test"));assert.equal(response.status,503);assert.ok(!(await response.text()).includes("private database details"));
      user={id:"admin",roles:["ADMIN"],role:"ADMIN"};response=await GET(request("test"));assert.equal(response.status,503);
    `;
    const result = Bun.spawnSync([process.execPath, "-e", script]);
    if (result.exitCode) throw new Error(result.stderr.toString());
    expect(result.exitCode).toBe(0);
  });
});
