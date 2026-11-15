import { describe, expect, it } from "bun:test";
import { fileURLToPath } from "node:url";

describe("Container schema readiness", () => {
  it("does not start the application after an enabled schema sync fails", () => {
    // The integration suite runs inside the Linux test container, like deployment.
    const path = fileURLToPath(new URL("./entrypoint.sh", import.meta.url));
    const script = `bunx() { return 1; }
      export AUTO_MIGRATE=true ENABLE_CRON=false
      . "$1"`;
    const result = Bun.spawnSync(
      ["sh", "-c", script, "entrypoint-fixture", path],
      { stdout: "pipe", stderr: "pipe" }
    );
    expect(result.exitCode).toBe(1);
    expect(result.stdout.toString()).toContain("Startup aborted");
    expect(result.stdout.toString()).not.toContain(
      "Starting application on port"
    );
  });

  it("uses --accept-data-loss during non-interactive schema sync and starts the app", () => {
    const path = fileURLToPath(new URL("./entrypoint.sh", import.meta.url));
    const script = `bunx() { printf 'BUNX:%s\n' "$*"; return 0; }
      mkdir() { return 0; }
      chown() { return 0; }
      id() { echo 1001; }
      export AUTO_MIGRATE=true ENABLE_CRON=false
      ENTRY="$1"
      set -- echo APP_STARTED
      . "$ENTRY"`;
    const result = Bun.spawnSync(
      ["sh", "-c", script, "entrypoint-fixture", path],
      { stdout: "pipe", stderr: "pipe" }
    );
    const stdout = result.stdout.toString();
    expect(result.exitCode).toBe(0);
    expect(stdout).toContain("BUNX:prisma db push --accept-data-loss");
    expect(stdout).toContain("Database schema push succeeded.");
    expect(stdout).toContain("Starting application on port");
    expect(stdout).toContain("APP_STARTED");
  });
});
