import { describe, expect, it } from "bun:test";
import { assertTestDatabaseUrl } from "./test-database-url";

describe("Database test isolation", () => {
  it("guards reused singleton clients before any application database can be used", () => {
    for (const [modulePath, setup, call] of [
      [
        "./lib/prisma.ts",
        "globalThis.prisma={};process.env.DATABASE_URL='postgresql://fixture@localhost:1/aldera_tech';",
        "",
      ],
      [
        "./lib/router-db.ts",
        "globalThis.routerPool={};process.env.ROUTER_DATABASE_URL='postgresql://fixture@localhost:1/aldera_router';",
        "module.getRouterPool();",
      ],
    ]) {
      const script = `import assert from 'node:assert/strict';${setup}let blocked=false;try{const module=await import('${modulePath}');${call}}catch(error){blocked=error.message.includes('Database pengujian');}assert.equal(blocked,true);`;
      const result = Bun.spawnSync(
        [process.execPath, "--no-env-file", "-e", script],
        { stdout: "pipe", stderr: "pipe" }
      );
      if (result.exitCode) throw Error(result.stderr.toString());
      expect(result.exitCode).toBe(0);
    }
  });
  for (const name of [
    "aldera_tech",
    "aldera_router",
    "production",
    "contest",
    "staging",
  ])
    it(`rejects ${name}`, () =>
      expect(() =>
        assertTestDatabaseUrl(`postgresql://fixture@localhost/${name}`)
      ).toThrow());
  it("rejects missing and malformed URLs", () => {
    expect(() => assertTestDatabaseUrl(undefined)).toThrow();
    expect(() => assertTestDatabaseUrl("invalid")).toThrow();
    expect(() =>
      assertTestDatabaseUrl("mysql://fixture@localhost/aldera_test")
    ).toThrow();
  });
  it("accepts explicitly named isolated databases", () => {
    for (const name of [
      "aldera_tech_test",
      "aldera_test_123",
      "test",
      "aldera_recovery_test",
    ])
      expect(
        assertTestDatabaseUrl(`postgresql://fixture@localhost/${name}`)
      ).toEndWith(name);
  });
});
