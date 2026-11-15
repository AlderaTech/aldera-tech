import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("Read-only staging startup diagnostics", () => {
  it("reports restart failures and redacts credentials without inspecting environment", () => {
    const script = fileURLToPath(
      new URL("./inspect-staging.sh", import.meta.url)
    );
    const fixture = `docker() {
      case "$1" in
        inspect) printf 'state=restarting health=unhealthy restarts=4 exit=1\n';;
        logs) printf '%s\n' 'Error: prisma postgres://user:private@db/test API_KEY=private' '[Entrypoint] Startup aborted.' 'unrelated business data';;
        *) return 90;;
      esac
    }
    . "$1"`;
    const result = Bun.spawnSync(["sh", "-c", fixture, "fixture", script]);
    const output = result.stdout.toString();
    expect(result.exitCode).toBe(0);
    expect(output).toContain("state=restarting");
    expect(output).toContain("Startup aborted");
    expect(output).toContain("[REDACTED_URL]");
    expect(output).not.toContain("private");
    expect(output).not.toContain("unrelated business data");
    expect(readFileSync(script, "utf8")).not.toContain(".Config.Env");
  });

  it("allows manual diagnostics without building, deploying, or mutating the database", () => {
    const workflow = readFileSync(
      new URL("../.github/workflows/build-and-deploy.yml", import.meta.url),
      "utf8"
    );
    expect(workflow).toContain("diagnose_staging:");
    expect(workflow).toContain("script_path: docker/inspect-staging.sh");
    expect(workflow).toContain("!inputs.diagnose_staging");
  });
});
