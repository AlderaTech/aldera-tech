import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DASHBOARD_ROUTES } from "@/lib/routes";

let pathname: string = DASHBOARD_ROUTES.home;
mock.module("next/navigation", () => ({ usePathname: () => pathname }));
const { OverviewShell } = await import("./overview-shell");

describe("Isolasi background Ringkasan", () => {
  it("mengaktifkan latar rata hanya pada Ringkasan", () => {
    pathname = DASHBOARD_ROUTES.home;
    expect(
      renderToStaticMarkup(
        <OverviewShell>
          <p>Isi</p>
        </OverviewShell>
      )
    ).toContain('data-overview-home="true"');
    for (const route of [
      DASHBOARD_ROUTES.projects,
      DASHBOARD_ROUTES.profile,
      DASHBOARD_ROUTES.settings,
      DASHBOARD_ROUTES.invoices,
      DASHBOARD_ROUTES.aiRelay,
    ]) {
      pathname = route;
      expect(
        renderToStaticMarkup(
          <OverviewShell>
            <p>Isi</p>
          </OverviewShell>
        )
      ).not.toContain("data-overview-home");
    }
  });
});
