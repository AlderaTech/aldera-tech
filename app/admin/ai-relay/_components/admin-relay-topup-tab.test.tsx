import { expect, it } from "bun:test";
import { mutations, renderRelay, ticket } from "../_test-utils/relay-fixture";
const { AdminRelayTopupTab: Component } =
  await import("./admin-relay-topup-tab");
it("membedakan antrean kosong dan nominal tiket asli", () => {
  expect(renderRelay(Component, "topup")).toContain(
    'data-admin-empty-context="topups"'
  );
  const html = renderRelay(
    Component,
    "topup",
    {},
    { initialPendingTopups: [ticket] }
  );
  expect(html).toContain(ticket.user_name);
  expect(html).toContain("50.123");
  expect(mutations.approveTopupRequest).not.toHaveBeenCalled();
  expect(mutations.rejectTopupRequest).not.toHaveBeenCalled();
});
