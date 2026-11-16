import { appendFile, writeFile } from "node:fs/promises";
import { readJobHistory } from "./job-history";
import {
  buildTestMatrix,
  discoverTestFiles,
  discoverLintFiles,
  shardCount,
  suiteFor,
  type JobTiming,
  TEST_SUITES,
} from "./test-sharding";

const files = discoverTestFiles();
let timings: JobTiming[] = [];
if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY) {
  try {
    timings = await readJobHistory(
      process.env.GITHUB_REPOSITORY,
      process.env.GITHUB_TOKEN,
      process.env.GITHUB_RUN_ID ?? ""
    );
  } catch (error) {
    // Missing history only affects parallelism. Every test still runs.
    console.warn(
      `::warning::${error instanceof Error ? error.message : "Cannot read Actions history."} Using one shard per suite.`
    );
  }
}
const matrix = buildTestMatrix(files, timings);
const lintTotal = shardCount(
  discoverLintFiles().length,
  timings.filter((timing) => timing.suite === "lint")
);
const lintMatrix = {
  include: Array.from({ length: lintTotal }, (_, index) => ({
    shard: index + 1,
    total: lintTotal,
  })),
};
const plan = {
  thresholdSeconds: 420,
  timings,
  matrix,
  lintMatrix,
  counts: Object.fromEntries(
    TEST_SUITES.map((suite) => [
      suite,
      files.filter((file) => suiteFor(file) === suite).length,
    ])
  ),
};
await writeFile("ci-test-plan.json", JSON.stringify(plan, null, 2) + "\n");
if (process.env.GITHUB_OUTPUT)
  await appendFile(
    process.env.GITHUB_OUTPUT,
    `matrix=${JSON.stringify(matrix)}\nlint_matrix=${JSON.stringify(lintMatrix)}\n`
  );
console.log(JSON.stringify(plan, null, 2));
for (const timing of timings) {
  if (timing.seconds > 420 && timing.total >= 8) {
    console.warn(
      `::warning::${timing.suite} still exceeds seven minutes at eight shards. Split slow test files or investigate setup time before increasing the runner budget.`
    );
  }
}
if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = TEST_SUITES.map(
    (suite) =>
      `| ${suite} | ${plan.counts[suite]} | ${matrix.include.filter((entry) => entry.suite === suite).length} |`
  );
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    `## Test runners\n\n| Suite | Files | Shards |\n| --- | ---: | ---: |\n${rows.join("\n")}\n\nJobs exceeding 420 seconds increase their suite's shard count on the next run (maximum eight). Build and deploy are separate from test sharding.\n`
  );
}
