import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createAdminNavigationMock } from "../../_test-utils/navigation";
let query = "";
mock.module("next/navigation", () =>
  createAdminNavigationMock({ query: () => query })
);
const { CalculatorAdmin } = await import("./calculator-admin");
describe("Tab segmented kalkulator admin", () => {
  it("mempertahankan semua tujuan URL dan data konfigurasi tanpa mutasi", () => {
    for (const tab of ["types", "features", "addons", "config"]) {
      query = "tab=" + tab;
      (
        globalThis as unknown as { __mockSearchParams?: URLSearchParams }
      ).__mockSearchParams = new URLSearchParams(query);
      const html = renderToStaticMarkup(
        <CalculatorAdmin
          data={{ projectTypes: [], features: [], addOns: [], config: null }}
        />
      );
      expect(html).toContain('data-tab-count="4"');
      expect(html.match(/role="tab"/g)).toHaveLength(4);
      expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
      if (tab !== "config") expect(html).toContain("data-admin-empty");
    }
    delete (globalThis as unknown as { __mockSearchParams?: URLSearchParams })
      .__mockSearchParams;
  });
});
