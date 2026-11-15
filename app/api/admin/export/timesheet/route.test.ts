import { describe, expect, it } from "bun:test";

describe("Timesheet export validation and permissions", () => {
  it("rejects invalid ranges before querying and reports database failures truthfully", () => {
    const script = `import {mock} from "bun:test";import assert from "node:assert/strict";import {NextRequest} from "next/server";
      let user=null,fail=false,calls=[];
      mock.module("@/auth",()=>({auth:async()=>user?{user}:null}));
      mock.module("@/lib/prisma",()=>({prisma:{timeEntry:{findMany:async args=>{calls.push(args);if(fail)throw Error("private database details");return [];}}}}));
      const {GET}=await import("./app/api/admin/export/timesheet/route.ts");
      const request=q=>new NextRequest("http://localhost/api/admin/export/timesheet?"+q);
      assert.equal((await GET(request("from=invalid"))).status,403);assert.equal(calls.length,0);
      user={id:"client",role:"CLIENT",roles:["CLIENT"]};assert.equal((await GET(request(""))).status,403);
      user={id:"admin",role:"ADMIN",roles:["ADMIN"]};
      for(const query of ["from=invalid","from=2026-02-30","from=2026-11-16&to=2026-10-16"]){assert.equal((await GET(request(query))).status,400);}
      assert.equal(calls.length,0);
      let response=await GET(request("from=2026-11-01&to=2026-11-16"));assert.equal(response.status,200);assert.ok(response.headers.get("content-type").includes("text/csv"));assert.equal(calls.length,1);
      assert.equal(calls[0].where.startedAt.lte.getHours(),23);
      fail=true;console.error=()=>{};response=await GET(request(""));assert.equal(response.status,503);assert.ok(!(await response.text()).includes("private database details"));
    `;
    const result = Bun.spawnSync([process.execPath, "-e", script]);
    if (result.exitCode) throw new Error(result.stderr.toString());
    expect(result.exitCode).toBe(0);
  });
});
