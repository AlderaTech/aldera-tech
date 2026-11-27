import { describe, expect, it } from "bun:test";
import { verifyTestResults, type TestManifest } from "./test-results";

describe("CI deployment gate", () => {
  const files = [
    "a.test.ts",
    "b.test.ts",
    "components/a.test.tsx",
    "lib/actions/a.test.ts",
  ];
  const manifests: TestManifest[] = [
    { suite: "unit", shard: 1, total: 2, files: [files[0]], exitCode: 0 },
    { suite: "unit", shard: 2, total: 2, files: [files[1]], exitCode: 0 },
    { suite: "ui", shard: 1, total: 1, files: [files[2]], exitCode: 0 },
    {
      suite: "integration",
      shard: 1,
      total: 1,
      files: [files[3]],
      exitCode: 0,
    },
  ];

  it("accepts every test file exactly once across successful suite/shard jobs", () => {
    expect(() => verifyTestResults(files, manifests)).not.toThrow();
  });
  it("blocks deploy if an entire suite, a shard, or all reports are missing", () => {
    expect(() => verifyTestResults(files, [])).toThrow("Missing");
    expect(() => verifyTestResults(files, manifests.slice(0, -1))).toThrow(
      "Missing"
    );
    expect(() => verifyTestResults(files, manifests.slice(1))).toThrow(
      "Missing"
    );
  });
  it("blocks duplicates, substituted files, and failed shards", () => {
    expect(() =>
      verifyTestResults(files, [...manifests, manifests[0]])
    ).toThrow("Duplicate");
    expect(() =>
      verifyTestResults(files, [{ ...manifests[0], exitCode: 1 }])
    ).toThrow("failed");
    expect(() =>
      verifyTestResults(files, [{ ...manifests[0], files: [files[1]] }])
    ).toThrow("does not match");
  });
});
