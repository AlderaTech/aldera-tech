import { expect, it } from "bun:test";
import { mutations, renderRelay, ticket } from "../_test-utils/relay-fixture";
const { AdminRelayPaymentProofDialog: Component } =
  await import("./admin-relay-payment-proof-dialog");
it("menampilkan dialog hanya saat dibuka tanpa menjalankan mutasi", () => {
  expect(renderRelay(Component)).not.toContain('role="dialog"');
  const html = renderRelay(Component, "overview", { viewProofTicket: ticket });
  expect(html).toContain('role="dialog"');
  expect(html).toContain("Tutup");
  expect(html).toContain("/api/admin/ai-relay/topups/902/proof");
  expect(html).not.toContain("fixture-proof");
  expect(html).toContain("noopener noreferrer");
  Object.values(mutations).forEach((fn) => expect(fn).not.toHaveBeenCalled());
});
