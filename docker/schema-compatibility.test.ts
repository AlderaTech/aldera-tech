import { describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "pg";

describe("Existing database role compatibility", () => {
  it("syncs safely without deleting legacy role values or changing user data", async () => {
    const schema = `startup_${randomUUID().replaceAll("-", "")}`;
    const databaseUrl = new URL(process.env.DATABASE_URL!);
    databaseUrl.searchParams.set("schema", schema);
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const directory = await mkdtemp(join(tmpdir(), "aldera-schema-compat-"));
    const current = await readFile(
      new URL("../prisma/schema.prisma", import.meta.url),
      "utf8"
    );
    const baseline = join(directory, "baseline.prisma");
    await writeFile(
      baseline,
      current.replace(/^  (OWNER|DESIGNER|ACCOUNTANT)\r?\n/gm, "")
    );
    const sync = async (schemaPath: string) => {
      const child = Bun.spawn(
        [process.execPath, "x", "prisma", "db", "push", "--schema", schemaPath],
        {
          env: { ...process.env, DATABASE_URL: databaseUrl.toString() },
          stdout: "pipe",
          stderr: "pipe",
        }
      );
      const [stdout, stderr, code] = await Promise.all([
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
        child.exited,
      ]);
      return { code, output: stdout + stderr };
    };
    await client.connect();
    try {
      await client.query(`CREATE SCHEMA "${schema}"`);
      await client.query(`SET search_path TO "${schema}"`);
      expect((await sync(baseline)).code).toBe(0);
      const migration = await readFile(
        new URL(
          "../prisma/migrations/20261116010000_preserve_legacy_role_values/migration.sql",
          import.meta.url
        ),
        "utf8"
      );
      await client.query(migration);
      await client.query(migration); // Reapplication must preserve existing enums.
      await client.query(`INSERT INTO "User" (id, email, name, password, roles, "updatedAt")
        VALUES ('legacy-user', 'legacy@example.test', 'Existing user', 'test-not-a-real-password',
        ARRAY['OWNER', 'DESIGNER', 'ACCOUNTANT']::"Role"[], CURRENT_TIMESTAMP)`);
      const before = await client.query('SELECT * FROM "User" WHERE id = $1', [
        "legacy-user",
      ]);
      const rejected = await sync(baseline);
      expect(rejected.code).not.toBe(0);
      expect(rejected.output).toContain("--accept-data-loss");
      const accepted = await sync(join(process.cwd(), "prisma/schema.prisma"));
      expect(accepted.code).toBe(0);
      expect(accepted.output).not.toContain("There might be data loss");
      const after = await client.query('SELECT * FROM "User" WHERE id = $1', [
        "legacy-user",
      ]);
      expect(after.rows).toEqual(before.rows);
    } finally {
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await client.end();
      await rm(directory, { recursive: true, force: true });
    }
  }, 120000);
});
