import { expect, it } from "bun:test";
import { renderRelay } from "../_test-utils/relay-fixture";
const { AdminRelayOverviewTab: Component } =
  await import("./admin-relay-overview-tab");
it("menampilkan nilai metrik asli tanpa mengubah nilai nol", () => {
  const html = renderRelay(Component);
  expect(html).toContain("0");
  expect(html).not.toContain("NaN");
  const populated = renderRelay(
    Component,
    "overview",
    {},
    {
      initialMetrics: {
        totalOmzet: 87000,
        totalTokens: 1234,
        totalUsageCost: 12000,
        netMargin: 75000,
        pendingCount: 2,
        approvedCount: 3,
        rejectedCount: 1,
      },
    }
  );
  expect(populated).toContain("87.000");
  expect(populated).toContain("75.000");
});
