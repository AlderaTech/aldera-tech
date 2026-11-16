import { expect, it } from "bun:test";
import { mutations, renderRelay, ticket } from "../_test-utils/relay-fixture";
const { AdminRelayRejectTopupDialog: Component } =
  await import("./admin-relay-reject-topup-dialog");
it("menampilkan dialog hanya saat dibuka tanpa menjalankan mutasi", () => {
  expect(renderRelay(Component)).not.toContain('role="dialog"');
  const html = renderRelay(Component, "overview", { rejectingTicket: ticket });
  expect(html).toContain('role="dialog"');
  expect(html).toContain("Konfirmasi Tolak");
  expect(html).toContain("Opsional");
  expect(html).toContain("placeholder=");
  Object.values(mutations).forEach((fn) => expect(fn).not.toHaveBeenCalled());
});
it("menonaktifkan tindakan saat permintaan diproses", () => {
  expect(
    renderRelay(Component, "overview", {
      ...{ rejectingTicket: ticket },
      isPending: true,
    })
  ).toContain("disabled");
});
