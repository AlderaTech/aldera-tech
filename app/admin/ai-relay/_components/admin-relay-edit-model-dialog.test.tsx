import { expect, it } from "bun:test";
import { model, mutations, renderRelay } from "../_test-utils/relay-fixture";
const { AdminRelayEditModelDialog: Component } =
  await import("./admin-relay-edit-model-dialog");
it("menampilkan dialog hanya saat dibuka tanpa menjalankan mutasi", () => {
  expect(renderRelay(Component)).not.toContain('role="dialog"');
  const html = renderRelay(Component, "overview", {
    editingModel: model,
    editDisplayName: model.display_name,
  });
  expect(html).toContain('role="dialog"');
  expect(html).toContain("Simpan");
  expect(html).toContain(model.model_name);
  expect(html).toContain('value="Model fixture"');
  Object.values(mutations).forEach((fn) => expect(fn).not.toHaveBeenCalled());
});
it("menonaktifkan tindakan saat permintaan diproses", () => {
  expect(
    renderRelay(Component, "overview", {
      ...{ editingModel: model, editDisplayName: model.display_name },
      isPending: true,
    })
  ).toContain("disabled");
});
