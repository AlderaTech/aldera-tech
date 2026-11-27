import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { assertTestDatabaseUrl } from "../lib/test-database-url";
import { testEnvironment } from "./test-environment";
import { MAX_SHARDS, TEST_SUITES, type TestSuite } from "./ci/test-sharding";

const [major, minor, patch] = Bun.version.split(".").map(Number);
if (major < 1 || (major === 1 && (minor < 4 || (minor === 4 && patch < 4)))) {
  throw new Error(
    "Pengujian membutuhkan Bun 1.4.4 atau lebih baru untuk isolasi mock dan lockfile v3."
  );
}

const container = `aldera-test-${randomUUID()}`;
const schemaRevision = "b6c89b69f39ea5d6f5fbcba2dcb6bb9b22ee0c0e";
const schemaFiles = [
  "init.sql",
  "migrations/001_initial_schema.sql",
  "migrations/002_account_binding.sql",
  "migrations/003_bot_cms_and_payment_settings.sql",
  "migrations/004_service_availability.sql",
  "seeds/001_initial_pricing.sql",
];
const args = process.argv.slice(2);
const ciSuiteArg = args.find((arg) => arg.startsWith("--ci-suite="));
const ciSuite = ciSuiteArg?.slice(11);
const ciShard = (
  args.find((arg) => arg.startsWith("--ci-shard="))?.slice(11) ?? "1/1"
).split("/");
if (ciSuiteArg !== undefined && !TEST_SUITES.includes(ciSuite as TestSuite)) {
  throw new Error("CI suite harus unit, ui, atau integration.");
}
if (args.some((arg) => arg.startsWith("--ci-shard=")) && !ciSuite) {
  throw new Error("Pilih CI suite sebelum menentukan shard.");
}
if (
  ciSuite &&
  (ciShard.length !== 2 ||
    ciShard.some((value) => !/^[1-8]$/.test(value)) ||
    Number(ciShard[0]) > Number(ciShard[1]) ||
    Number(ciShard[1]) > MAX_SHARDS)
) {
  throw new Error("CI shard harus berformat indeks/jumlah yang valid.");
}
const schemaDirectory = args
  .find((arg) => arg.startsWith("--router-schema="))
  ?.split("=")
  .slice(1)
  .join("=");
const testArgs = args.filter(
  (arg) =>
    !["--router-schema=", "--ci-suite=", "--ci-shard="].some((prefix) =>
      arg.startsWith(prefix)
    )
);
if (ciSuite && testArgs.length)
  throw new Error("CI suite tidak menerima filter test tambahan.");

async function docker(args: string[], input?: string) {
  const child = Bun.spawn(["docker", ...args], {
    stdin: input === undefined ? "ignore" : "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });
  if (input !== undefined && child.stdin) {
    child.stdin.write(input);
    child.stdin.end();
  }
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  if (code !== 0)
    throw new Error(`Docker ${args[0]} gagal: ${stderr.slice(-700)}`);
  return stdout.trim();
}

async function cleanup() {
  try {
    await docker(["stop", container]);
  } catch {
    /* The owned container may already have exited. */
  }
}
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.once(signal, () => {
    void cleanup().finally(() => process.exit(130));
  });

try {
  console.log(
    "Menyiapkan PostgreSQL sementara; database aplikasi tidak digunakan."
  );
  await docker([
    "run",
    "-d",
    "--rm",
    "--name",
    container,
    "--tmpfs",
    "/var/lib/postgresql/data",
    "-p",
    "127.0.0.1::5432",
    "-e",
    "POSTGRES_PASSWORD=isolated_test_only",
    "-e",
    "POSTGRES_DB=aldera_test",
    "postgres:17",
  ]);
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      await docker([
        "exec",
        container,
        "pg_isready",
        "-h",
        "127.0.0.1",
        "-U",
        "postgres",
      ]);
      ready = true;
      break;
    } catch {
      await Bun.sleep(500);
    }
  }
  if (!ready) throw new Error("Database uji tidak siap.");
  await docker([
    "exec",
    container,
    "createdb",
    "-U",
    "postgres",
    "aldera_router_test",
  ]);
  for (const file of schemaFiles) {
    let sql: string;
    if (schemaDirectory)
      sql = await readFile(resolve(schemaDirectory, file), "utf8");
    else {
      const response = await fetch(
        `https://raw.githubusercontent.com/Alfian57/server-infrastructure/${schemaRevision}/roles/applications/aldera-router-setup/files/${file}`,
        { signal: AbortSignal.timeout(20_000) }
      );
      if (!response.ok)
        throw new Error(
          "Schema router uji tidak tersedia. Gunakan --router-schema=<direktori-schema> untuk sumber lokal."
        );
      sql = await response.text();
    }
    await docker(
      [
        "exec",
        "-i",
        container,
        "psql",
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        "postgres",
        "-d",
        "aldera_router_test",
      ],
      sql
    );
  }
  await docker(
    [
      "exec",
      "-i",
      container,
      "psql",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "postgres",
      "-d",
      "aldera_router_test",
    ],
    "CREATE TABLE IF NOT EXISTS user_alert_cooldowns (id BIGSERIAL PRIMARY KEY,user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,last_low_balance_alert_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),alert_count INT NOT NULL DEFAULT 1,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());"
  );
  const port = (await docker(["port", container, "5432/tcp"]))
    .split(":")
    .at(-1);
  if (!port || !/^\d+$/.test(port))
    throw new Error("Port database uji tidak valid.");
  const databaseUrl = `postgresql://postgres:isolated_test_only@127.0.0.1:${port}/aldera_test?schema=public`;
  const routerUrl = `postgresql://postgres:isolated_test_only@127.0.0.1:${port}/aldera_router_test`;
  assertTestDatabaseUrl(databaseUrl);
  assertTestDatabaseUrl(routerUrl);
  const env = testEnvironment(databaseUrl, routerUrl);
  const schema = Bun.spawn(
    [process.execPath, "--no-env-file", "x", "prisma", "db", "push"],
    { env, stdout: "inherit", stderr: "inherit" }
  );
  if ((await schema.exited) !== 0)
    throw new Error("Penerapan schema uji gagal; test tidak dijalankan.");
  const tests = Bun.spawn(
    ciSuite
      ? [
          process.execPath,
          "--no-env-file",
          "scripts/ci/run-tests.ts",
          ciSuite,
          ...ciShard,
        ]
      : [process.execPath, "--no-env-file", "test", "--isolate", ...testArgs],
    { env, stdout: "inherit", stderr: "inherit" }
  );
  process.exitCode = await tests.exited;
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Pengujian terisolasi gagal."
  );
  process.exitCode = 1;
} finally {
  await cleanup();
}
