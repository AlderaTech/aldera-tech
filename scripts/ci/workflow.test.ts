import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const workflow = readFileSync(".github/workflows/build-and-deploy.yml", "utf8");

describe("Parallel CI runners", () => {
  it("separates analysis, typecheck, configuration, and suite runners", () => {
    for (const job of [
      "plan",
      "lint",
      "typecheck",
      "configuration",
      "test-suites",
      "validate",
      "test",
      "docker",
    ]) {
      expect(workflow).toContain(`\n  ${job}:\n`);
    }
    expect(workflow).toContain("fromJSON(needs.plan.outputs.matrix)");
    expect(workflow).toContain("fromJSON(needs.plan.outputs.lint_matrix)");
    expect(workflow).toContain("fail-fast: false");
    expect(workflow).toContain("actions: read");
  });
  it("preserves required check names and blocks build until both gates pass", () => {
    expect(workflow).toContain("name: Validate Code & Types");
    expect(workflow).toContain("name: Run Unit & Integration Tests");
    expect(workflow).toContain("needs: [validate, test]");
    expect(workflow).toContain('test "$TEST_RESULT" = success');
    expect(workflow).toContain("scripts/ci/test-results.ts");
  });
  it("only provisions databases for integration and preserves credential-free test children", () => {
    expect(workflow).toContain(
      "matrix.suite == 'integration' && 'postgres:16-alpine' || ''"
    );
    expect(workflow).toContain("ref: d75d14412b5277d174618602e7a8d7649cc2f02c");
    const runner = readFileSync("scripts/ci/run-tests.ts", "utf8");
    expect(runner).toContain("assertTestDatabaseUrl(database)");
    expect(runner).toContain("env: testEnvironment(database, router)");
    expect(runner).toContain('"--isolate"');
    expect(runner).toContain('"--no-env-file"');
  });
  it("keeps reports for failures and refuses missing artifacts", () => {
    expect(workflow).toContain("if: always()");
    expect(workflow).toContain("if-no-files-found: error");
    expect(workflow).toContain("include-hidden-files: true");
    expect(workflow).not.toContain("continue-on-error: true");
  });
});
