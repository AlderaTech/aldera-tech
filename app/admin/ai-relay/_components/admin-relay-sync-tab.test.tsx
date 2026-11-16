import { expect, it } from "bun:test";
import { mutations, renderRelay } from "../_test-utils/relay-fixture";
const { AdminRelaySyncTab: Component } = await import("./admin-relay-sync-tab");
it("menjaga tindakan sinkronisasi eksplisit dan kondisi proses terbaca", () => {
  const html = renderRelay(Component, "sync");
  expect(html).toContain("9router");
  expect(mutations.syncModelsFromUpstream).not.toHaveBeenCalled();
  const pending = renderRelay(Component, "sync", { isSyncing: true });
  expect(pending).toContain("disabled");
});
