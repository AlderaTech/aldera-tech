import { expect, it } from "bun:test";
import { model, mutations, renderRelay } from "../_test-utils/relay-fixture";
const { AdminRelayCreateModelDialog: Component } =
  await import("./admin-relay-create-model-dialog");
it("menampilkan dialog hanya saat dibuka tanpa menjalankan mutasi", () => {
  expect(renderRelay(Component)).not.toContain('role="dialog"');
  const html = renderRelay(Component, "overview", {
    isAddModalOpen: true,
    newModelName: model.model_name,
    newDisplayName: model.display_name,
  });
  expect(html).toContain('role="dialog"');
  expect(html).toContain("Simpan &amp; Aktifkan");
  expect(html).toContain('id="model_name"');
  expect(html).toContain("placeholder=");
  expect(html).toContain(model.model_name);
  Object.values(mutations).forEach((fn) => expect(fn).not.toHaveBeenCalled());
});
it("menonaktifkan tindakan saat permintaan diproses", () => {
  expect(
    renderRelay(Component, "overview", {
      ...{
        isAddModalOpen: true,
        newModelName: model.model_name,
        newDisplayName: model.display_name,
      },
      isPending: true,
    })
  ).toContain("disabled");
});
