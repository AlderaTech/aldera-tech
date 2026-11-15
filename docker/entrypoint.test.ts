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
});
