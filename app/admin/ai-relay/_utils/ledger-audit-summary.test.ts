import { expect, it } from "bun:test";
import { ledgerAuditSummary } from "./ledger-audit-summary";

it("does not declare an empty audit successful or assume five checks", () => {
  expect(ledgerAuditSummary([]).type).toBe("info");
  const check = {
    check_name: "fixture",
    status: "PASS" as const,
    violation_count: 0,
    description: "Fixture",
  };
  expect(ledgerAuditSummary([check])).toEqual({
    type: "success",
    message: "Pemeriksaan selesai: 1 aturan integritas lulus.",
  });
  expect(ledgerAuditSummary([{ ...check, status: "FAIL" }]).type).toBe("error");
});
