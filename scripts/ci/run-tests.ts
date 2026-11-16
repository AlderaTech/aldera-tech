import { mkdir, writeFile } from "node:fs/promises";
import { assertTestDatabaseUrl } from "../../lib/test-database-url";
import { testEnvironment } from "../test-environment";
import {
  discoverTestFiles,
  shardFiles,
  suiteFor,
  TEST_SUITES,
  type TestSuite,
} from "./test-sharding";

const [suiteArg, shardArg = "1", totalArg = "1"] = process.argv.slice(2);
if (!TEST_SUITES.includes(suiteArg as TestSuite))
  throw new Error("Specify unit, ui, or integration.");
const suite = suiteArg as TestSuite;
const files = shardFiles(
  discoverTestFiles().filter((file) => suiteFor(file) === suite),
  Number(shardArg),
  Number(totalArg)
);
if (!files.length)
  throw new Error("Empty shard; refusing to report a false success.");
let database = "postgresql://fixture@127.0.0.1:1/aldera_test";
let router = "postgresql://fixture@127.0.0.1:1/aldera_router_test";
if (suite === "integration") {
  database = process.env.DATABASE_URL ?? "";
  router = process.env.ROUTER_DATABASE_URL ?? "";
  assertTestDatabaseUrl(database);
  assertTestDatabaseUrl(router);
}
await mkdir(".ci-reports", { recursive: true });
console.log(`${suite}: shard ${shardArg}/${totalArg}, ${files.length} files`);
const tests = Bun.spawn(
  [
    process.execPath,
    "--no-env-file",
    "test",
    "--isolate",
    "--reporter=junit",
    `--reporter-outfile=.ci-reports/${suite}-${shardArg}.xml`,
    ...files.map((file) => `./${file}`),
  ],
  {
    env: testEnvironment(database, router),
    stdout: "inherit",
    stderr: "inherit",
  }
);
const exitCode = await tests.exited;
await writeFile(
  `.ci-reports/${suite}-${shardArg}.manifest.json`,
  JSON.stringify(
    {
      suite,
      shard: Number(shardArg),
      total: Number(totalArg),
      files,
      exitCode,
    },
    null,
    2
  )
);
process.exitCode = exitCode;
