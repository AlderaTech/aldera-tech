import { expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { testEnvironment } from "./test-environment";

it("does not inherit live credentials into the test child", () => {
  const before = process.env.TEST_LIVE_CREDENTIAL;
  process.env.TEST_LIVE_CREDENTIAL = "must-not-inherit";
  try {
    const env = testEnvironment(
      "postgresql://fixture@localhost/app_test",
      "postgresql://fixture@localhost/router_test"
    );
    expect(env.TEST_LIVE_CREDENTIAL).toBeUndefined();
    expect(env.MIDTRANS_IS_PRODUCTION).toBe("false");
    expect(env.NINE_ROUTER_API_KEY).toBe("");
    expect(env.WHATSAPP_API_URL).toBe("http://127.0.0.1:1");
  } finally {
    if (before === undefined) delete process.env.TEST_LIVE_CREDENTIAL;
    else process.env.TEST_LIVE_CREDENTIAL = before;
  }
});

it("never reuses port 5432 or suppresses schema failures", () => {
  const script = readFileSync("scripts/run-tests.ts", "utf8");
  expect(script).toContain("127.0.0.1::5432");
  expect(script).not.toContain("--accept-data-loss");
  expect(script).toContain("ON_ERROR_STOP=1");
  expect(script).toContain("finally");
  expect(script).toContain("--no-env-file");
});

it("rejects invalid CI suite/shard selections before creating a database", () => {
  for (const args of [
    ["--ci-suite="],
    ["--ci-suite=unknown"],
    ["--ci-shard=1/2"],
    ["--ci-suite=integration", "--ci-shard=0/2"],
    ["--ci-suite=integration", "--ci-shard=3/2"],
    ["--ci-suite=integration", "--ci-shard=1/9"],
  ]) {
    const child = Bun.spawnSync(
      [process.execPath, "--no-env-file", "scripts/run-tests.ts", ...args],
      { stdout: "pipe", stderr: "pipe" }
    );
    expect(child.exitCode).not.toBe(0);
    expect(child.stdout.toString()).not.toContain("Menyiapkan PostgreSQL");
    expect(child.stderr.toString()).toContain("CI");
  }
});
