import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  discoverTestFiles,
  shardFiles,
  suiteFor,
  TEST_SUITES,
  type TestSuite,
} from "./test-sharding";

export type TestManifest = {
  suite: TestSuite;
  shard: number;
  total: number;
  files: string[];
  exitCode: number;
};

export function verifyTestResults(
  expected: string[],
  manifests: TestManifest[]
): void {
  const actual: string[] = [];
  const identities = new Set<string>();
  for (const manifest of manifests) {
    if (!TEST_SUITES.includes(manifest.suite) || manifest.exitCode !== 0)
      throw new Error("Incomplete or failed test shard.");
    const identity = `${manifest.suite}-${manifest.shard}`;
    if (identities.has(identity)) throw new Error("Duplicate test shard.");
    identities.add(identity);
    const files = shardFiles(
      expected.filter((file) => suiteFor(file) === manifest.suite),
      manifest.shard,
      manifest.total
    );
    if (
      !files.length ||
      JSON.stringify(files) !== JSON.stringify(manifest.files)
    )
      throw new Error("Test shard file manifest does not match discovery.");
    actual.push(...manifest.files);
  }
  if (
    actual.length !== expected.length ||
    JSON.stringify(actual.sort()) !== JSON.stringify([...expected].sort())
  ) {
    throw new Error(
      "Missing or duplicated tests; refusing to approve the pipeline."
    );
  }
}

if (import.meta.main) {
  const directory = process.argv[2] ?? ".ci-reports";
  const filenames = (await readdir(directory)).filter((file) =>
    file.endsWith(".manifest.json")
  );
  const manifests: TestManifest[] = [];
  for (const file of filenames)
    manifests.push(JSON.parse(await readFile(join(directory, file), "utf8")));
  const expected = discoverTestFiles();
  verifyTestResults(expected, manifests);
  console.log(
    `Verified ${expected.length} test files across ${manifests.length} successful shards.`
  );
}
