import { expect, it } from "bun:test";
import { mutations, renderRelay } from "../_test-utils/relay-fixture";
const { AdminRelayAuditTab: Component } =
  await import("./admin-relay-audit-tab");
it("tidak menyatakan lulus ketika belum ada hasil, lalu menampilkan hasil asli", () => {
  const empty = renderRelay(Component, "audit");
  expect(empty).toContain("Belum ada hasil pemeriksaan");
  expect(empty).not.toContain("SEMUA PASS");
  const html = renderRelay(
    Component,
    "audit",
    {},
    {
      initialAuditResults: [
        {
          check_name: "ROW_ARITHMETIC_INVARIANT",
          status: "FAIL",
          violation_count: 3,
          description: "fixture",
        },
      ],
    }
  );
  expect(html).toContain("FAIL");
  expect(html).toContain("3");
  expect(html).not.toContain("ROW_ARITHMETIC_INVARIANT");
  expect(mutations.runLedgerAudit).not.toHaveBeenCalled();
});
