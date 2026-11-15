import { describe, expect, it } from "bun:test";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

describe("Container schema readiness", () => {
  it("starts after a safe schema sync without accepting destructive changes", () => {
    const path = fileURLToPath(new URL("./entrypoint.sh", import.meta.url));
    const script = `bunx() { printf 'BUNX:%s\\n' "$*"; return 0; }
      mkdir() { return 0; }
      id() { echo 1001; }
      export AUTO_MIGRATE=true ENABLE_CRON=false
      ENTRY="$1"
      set -- echo APP_STARTED
      . "$ENTRY"`;
    const result = Bun.spawnSync(["sh", "-c", script, "fixture", path]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain("BUNX:prisma db push");
    expect(result.stdout.toString()).toContain("APP_STARTED");
    expect(readFileSync(path, "utf8")).not.toMatch(
      /--accept-data-loss|--force-reset/
    );
  });

  it("packages generated Prisma runtime dependencies from the builder", () => {
    const dockerfile = readFileSync(
      new URL("./Dockerfile", import.meta.url),
      "utf8"
    );
    expect(dockerfile).toContain(
      "COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules"
    );
    expect(dockerfile).not.toContain(
      "COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules"
    );
  });

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
