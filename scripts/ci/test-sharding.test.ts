import { describe, expect, it } from "bun:test";
import {
  buildTestMatrix,
  discoverTestFiles,
  shardCount,
  shardFiles,
  suiteFor,
} from "./test-sharding";
import { parseTiming, readJobHistory } from "./job-history";

describe("CI suite partition and seven-minute budget", () => {
  it("keeps UI, isolated database integration, and unit tests separate", () => {
    expect(suiteFor("components/ui/dialog.test.tsx")).toBe("ui");
    expect(suiteFor("lib/actions/password-reset-actions.test.ts")).toBe(
      "integration"
    );
    expect(suiteFor("app/api/upload/route.test.ts")).toBe("integration");
    expect(suiteFor("lib/login-rate-limit.test.ts")).toBe("integration");
    expect(suiteFor("docker/schema-compatibility.test.ts")).toBe("integration");
    expect(suiteFor("app/(public)/ai-relay/page.test.tsx")).toBe("integration");
    expect(suiteFor("lib/calculator-utils.test.ts")).toBe("unit");
    expect(suiteFor(".\\lib\\invoice-snap-session.test.ts")).toBe(
      "integration"
    );
  });

  it("does not split a job at exactly seven minutes, but splits above it", () => {
    expect(shardCount(20, [])).toBe(1);
    expect(shardCount(20, [{ suite: "unit", total: 1, seconds: 420 }])).toBe(1);
    expect(shardCount(20, [{ suite: "unit", total: 1, seconds: 421 }])).toBe(2);
    expect(shardCount(20, [{ suite: "unit", total: 2, seconds: 480 }])).toBe(3);
  });

  it("retains existing shards and caps growth by file count and runner budget", () => {
    expect(shardCount(20, [{ suite: "ui", total: 3, seconds: 40 }])).toBe(3);
    expect(shardCount(2, [{ suite: "ui", total: 8, seconds: 900 }])).toBe(2);
    expect(shardCount(100, [{ suite: "ui", total: 8, seconds: 900 }])).toBe(8);
    expect(shardCount(100, [{ suite: "ui", total: 1, seconds: NaN }])).toBe(1);
  });

  it("covers every repository test exactly once on every shard configuration", () => {
    const files = discoverTestFiles();
    for (const total of [1, 2, 4, 8]) {
      const actual = Array.from({ length: total }, (_, i) =>
        shardFiles(files, i + 1, total)
      ).flat();
      expect(actual.length).toBe(files.length);
      expect([...actual].sort()).toEqual(files);
    }
    expect(shardFiles(["b", "a", "b"], 1, 2)).toEqual(["a"]);
    expect(() => shardFiles(files, 0, 2)).toThrow();
    expect(() => shardFiles(files, 1, 0)).toThrow();
    expect(() => shardFiles(files, 1, 9)).toThrow();
  });

  it("changes only the slow suite and never emits empty shards", () => {
    const files = discoverTestFiles();
    const matrix = buildTestMatrix(files, [
      { suite: "ui", total: 1, seconds: 800 },
    ]);
    expect(matrix.include.filter((entry) => entry.suite === "ui")).toHaveLength(
      3
    );
    expect(
      matrix.include.filter((entry) => entry.suite === "unit")
    ).toHaveLength(1);
    for (const entry of matrix.include) {
      expect(
        shardFiles(
          files.filter((file) => suiteFor(file) === entry.suite),
          entry.shard,
          entry.total
        ).length
      ).toBeGreaterThan(0);
    }
    expect(() => buildTestMatrix(["only.test.ts"], [])).toThrow(
      "No tests in suite ui"
    );
  });
});

describe("Actions duration history", () => {
  const job = {
    name: "Unit Tests (shard 1/2)",
    started_at: "2026-11-16T00:00:00Z",
    completed_at: "2026-11-16T00:08:00Z",
    conclusion: "success",
  };
  it("accepts test failures/timeouts while ignoring deploy, cancelled, and invalid timings", () => {
    expect(parseTiming(job)).toEqual({ suite: "unit", total: 2, seconds: 480 });
    expect(parseTiming({ ...job, conclusion: "timed_out" })).not.toBeNull();
    expect(parseTiming({ ...job, conclusion: "cancelled" })).toBeNull();
    expect(
      parseTiming({ ...job, name: "Build and Publish Docker Image" })
    ).toBeNull();
    expect(parseTiming({ ...job, completed_at: "invalid" })).toBeNull();
    expect(parseTiming({ ...job, name: "Unit Tests (shard 3/2)" })).toBeNull();
  });

  it("uses the most recent run for each suite and excludes the current run", async () => {
    const requested: string[] = [];
    const request = (async (url: string | URL | Request) => {
      const path = String(url);
      requested.push(path);
      if (path.includes("/workflows/"))
        return Response.json({
          workflow_runs: [{ id: 3 }, { id: 2 }, { id: 1 }],
        });
      if (path.includes("/runs/2/")) return Response.json({ jobs: [job] });
      return Response.json({
        jobs: [
          { ...job, name: "Unit Tests (shard 1/1)" },
          { ...job, name: "UI Tests (shard 1/1)" },
          { ...job, name: "Integration Tests (shard 1/1)" },
        ],
      });
    }) as typeof fetch;
    const history = await readJobHistory(
      "fixture/repo",
      "fake-not-a-live-token",
      "3",
      request
    );
    expect(history.filter((entry) => entry.suite === "unit")).toEqual([
      { suite: "unit", total: 2, seconds: 480 },
    ]);
    expect(history).toHaveLength(3);
    expect(requested.some((path) => path.includes("/runs/3/"))).toBe(false);
  });

  it("surfaces a history API error without logging a credential", async () => {
    const request = (async () =>
      new Response("denied", { status: 403 })) as typeof fetch;
    await expect(
      readJobHistory("fixture/repo", "secret-not-to-print", "1", request)
    ).rejects.toThrow("HTTP 403");
    await expect(
      readJobHistory("../unexpected", "unused", "1", request)
    ).rejects.toThrow("Invalid GitHub repository");
  });
});
