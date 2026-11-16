import { expect, it } from "bun:test";
import { mutations, renderRelay, ticket } from "../_test-utils/relay-fixture";
const { AdminRelayApproveTopupDialog: Component } =
  await import("./admin-relay-approve-topup-dialog");
it("menampilkan dialog hanya saat dibuka tanpa menjalankan mutasi", () => {
  expect(renderRelay(Component)).not.toContain('role="dialog"');
  const html = renderRelay(Component, "overview", { approvingTicket: ticket });
  expect(html).toContain('role="dialog"');
  expect(html).toContain("Setujui");
  expect(html).toContain(ticket.user_name);
  expect(html).toContain("50.123");
  Object.values(mutations).forEach((fn) => expect(fn).not.toHaveBeenCalled());
});
it("menonaktifkan tindakan saat permintaan diproses", () => {
  expect(
    renderRelay(Component, "overview", {
      ...{ approvingTicket: ticket },
      isPending: true,
    })
  ).toContain("disabled");
});
