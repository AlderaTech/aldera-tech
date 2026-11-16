import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
import { API_ROUTES } from "@/lib/routes";
installAdminPageMocks();
const { getAdminAnalytics } = await import("../_data/analytics");
const { AnalyticsContent } = await import("./analytics-content");
it("keeps empty aggregates honest and CSV linked to the existing route", async () => {
  const data = await getAdminAnalytics();
  const html = renderToStaticMarkup(<AnalyticsContent data={data} />);
  expect(html).toContain("data-admin-empty-context");
  expect(html).toContain(API_ROUTES.exportAnalytics);
  expect(html).not.toContain("NaN");
  const populated = renderToStaticMarkup(
    <AnalyticsContent
      data={{
        ...data,
        totalRevenue: 100000,
        projectProfitability: [
          {
            id: "fixture",
            title: "Proyek fixture",
            revenue: 100000,
            cost: 60000,
            profit: 40000,
            margin: 40,
            hours: 0.4,
          },
        ],
        clientLTV: [
          { id: "fixture-client", name: "Klien fixture", ltv: 100000 },
        ],
      }}
    />
  );
  expect(populated).toContain("Proyek fixture");
  expect(populated).toContain("40%");
  expect(populated).toContain("100.000");
});
