import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "./_test-utils/page-mocks";
import { ADMIN_ROUTES } from "@/lib/routes";
installAdminPageMocks();
mock.module("./_data/overview", () => ({
  getAdminOverviewData: async () => ({
    stats: { total: 0, active: 0, pending: 0, orderPending: 0, revenue: 0 },
    recent: [],
    analytics: { revenueSeries: [], statusData: [], clientsData: [] },
  }),
}));
const { default: Page } = await import("./page");
describe("Route dashboard admin", () => {
  it("mempertahankan tiga tindakan utama dan angka nol dari server", async () => {
    const html = renderToStaticMarkup(await Page());
    for (const href of [
      ADMIN_ROUTES.projectNew,
      ADMIN_ROUTES.proposalNew,
      ADMIN_ROUTES.invoiceNew,
    ])
      expect(html).toContain('href="' + href + '"');
    expect(html.match(/data-admin-stat=/g)).toHaveLength(5);
    expect(html).toContain("Belum ada");
  });
});
