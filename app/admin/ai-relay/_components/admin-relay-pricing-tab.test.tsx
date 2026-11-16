import { expect, it } from "bun:test";
import { model, mutations, renderRelay } from "../_test-utils/relay-fixture";
const { AdminRelayPricingTab: Component } =
  await import("./admin-relay-pricing-tab");
it("menangani katalog kosong, ID lengkap, harga dan daftar besar", () => {
  expect(renderRelay(Component, "pricing")).toContain(
    "data-admin-empty-context"
  );
  const html = renderRelay(
    Component,
    "pricing",
    {},
    { initialPricing: [model] }
  );
  expect(html).toContain(model.model_name);
  expect(html).toContain("21.000");
  expect(html).toContain("42.000");
  expect(html).toContain("Cari model...");
  const large = renderRelay(
    Component,
    "pricing",
    {},
    {
      initialPricing: Array.from({ length: 200 }, (_, i) => ({
        ...model,
        id: i,
        model_name: "fixture/model-" + i,
      })),
    }
  );
  expect(large).toContain("fixture/model-199");
  expect(mutations.createModelPricing).not.toHaveBeenCalled();
});
