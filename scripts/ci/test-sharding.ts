import { spawnSync } from "node:child_process";

export const TEST_SUITES = ["unit", "ui", "integration"] as const;
export type TestSuite = (typeof TEST_SUITES)[number];
export const SHARD_THRESHOLD_SECONDS = 7 * 60;
export const MAX_SHARDS = 8;

export const SUITE_LABELS: Record<TestSuite, string> = {
  unit: "Unit Tests",
  ui: "UI Tests",
  integration: "Integration Tests",
};
export const HISTORY_LANES = ["lint", ...TEST_SUITES] as const;
export const LANE_LABELS = {
  ...SUITE_LABELS,
  lint: "Linter & Static Analysis",
};

// These suites exercise real PostgreSQL connections, transactions, or locks.
const DATABASE_TESTS = new Set([
  "app/(public)/ai-relay/page.test.tsx",
  "docker/schema-compatibility.test.ts",
  "lib/admin-aggregates.test.ts",
  "lib/backend-security.test.ts",
  "lib/cron-lock.test.ts",
  "lib/integration-sync.test.ts",
  "lib/invoice-balance-effects.test.ts",
  "lib/invoice-snap-session.test.ts",
  "lib/login-rate-limit.test.ts",
  "lib/manual-payment-verification.test.ts",
  "lib/proposal-transitions.test.ts",
  "lib/router-db.test.ts",
  "lib/router-db-adversarial.test.ts",
  "lib/upload-authorization.test.ts",
]);

export function suiteFor(file: string): TestSuite {
  const normalized = file.replaceAll("\\", "/").replace(/^\.\//, "");
  if (DATABASE_TESTS.has(normalized)) return "integration";
  if (/\.test\.[jt]sx$/.test(normalized)) return "ui";
  if (
    normalized.startsWith("lib/actions/") ||
    normalized.startsWith("app/api/") ||
    DATABASE_TESTS.has(normalized)
  )
    return "integration";
  return "unit";
}

function discoverFiles(patterns: string[]): string[] {
  const result = spawnSync(
    "git",
    [
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
      "--",
      ...patterns,
    ],
    { encoding: "utf8", windowsHide: true }
  );
  if (result.status !== 0) throw new Error("Cannot discover repository tests.");
  const files = [...new Set(result.stdout.split("\0").filter(Boolean))].sort();
  if (!files.length)
    throw new Error("No files discovered; refusing an empty CI run.");
  return files;
}

export function discoverTestFiles(): string[] {
  return discoverFiles(["*.test.ts", "*.test.tsx", "*.test.js", "*.test.jsx"]);
}

export function discoverLintFiles(): string[] {
  return discoverFiles([
    "*.ts",
    "*.tsx",
    "*.js",
    "*.jsx",
    "*.mjs",
    "*.cjs",
    "*.mts",
    "*.cts",
  ]);
}

export function shardFiles(
  files: string[],
  shard: number,
  total: number
): string[] {
  if (
    !Number.isInteger(total) ||
    total < 1 ||
    total > MAX_SHARDS ||
    !Number.isInteger(shard) ||
    shard < 1 ||
    shard > total
  ) {
    throw new Error("Invalid shard index/count.");
  }
  return [...new Set(files)]
    .sort()
    .filter((_, index) => index % total === shard - 1);
}

export type JobTiming = {
  suite: TestSuite | "lint";
  total: number;
  seconds: number;
};
export type TestMatrixEntry = {
  suite: TestSuite;
  label: string;
  shard: number;
  total: number;
};

export function shardCount(files: number, timings: JobTiming[]): number {
  const valid = timings.filter(
    ({ total, seconds }) =>
      Number.isInteger(total) &&
      total >= 1 &&
      total <= MAX_SHARDS &&
      Number.isFinite(seconds) &&
      seconds > 0
  );
  let count = 1;
  for (const timing of valid) {
    const required =
      timing.seconds > SHARD_THRESHOLD_SECONDS
        ? Math.max(
            timing.total + 1,
            Math.ceil((timing.total * timing.seconds) / 360)
          )
        : timing.total;
    count = Math.max(count, required);
  }
  return Math.min(MAX_SHARDS, Math.max(1, files), count);
}

export function buildTestMatrix(files: string[], timings: JobTiming[]) {
  const include: TestMatrixEntry[] = [];
  for (const suite of TEST_SUITES) {
    const suiteFiles = files.filter((file) => suiteFor(file) === suite);
    if (!suiteFiles.length) throw new Error(`No tests in suite ${suite}.`);
    const total = shardCount(
      suiteFiles.length,
      timings.filter((t) => t.suite === suite)
    );
    for (let shard = 1; shard <= total; shard++) {
      include.push({ suite, label: SUITE_LABELS[suite], shard, total });
    }
  }
  return { include };
}
