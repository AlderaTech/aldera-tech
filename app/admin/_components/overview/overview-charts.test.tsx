import { describe, expect, it } from "bun:test";
import { Children, isValidElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  RevenueAreaChart,
  ProjectStatusPie,
} from "@/components/dashboard/analytics-charts";
import { OverviewCharts } from "./overview-charts";
function findData(node: ReactNode, type: unknown): unknown {
  for (const child of Children.toArray(node)) {
    if (
      !isValidElement<{
        children?: ReactNode;
        data?: unknown;
        animate?: boolean;
      }>(child)
    )
      continue;
    if (child.type === type)
      return { data: child.props.data, animate: child.props.animate };
    const found = findData(child.props.children, type);
    if (found) return found;
  }
}
describe("Grafik operasional", () => {
  it("membedakan data kosong dari grafik yang tersedia", () => {
    const html = renderToStaticMarkup(
      <OverviewCharts
        analytics={{ revenueSeries: [], statusData: [], clientsData: [] }}
      />
    );
    expect(html).toContain("Belum ada data revenue");
    expect(html).toContain("Belum ada proyek");
    expect(html).not.toContain('<svg class="recharts');
  });
  it("meneruskan array asli tanpa mengubah nilai atau mengarang metrik", () => {
    const revenueSeries = [{ month: "Jan", revenue: 123456789 }],
      statusData = [{ name: "Dalam pengerjaan", value: 3 }];
    const tree = OverviewCharts({
      analytics: { revenueSeries, statusData, clientsData: [] },
    });
    expect(findData(tree, RevenueAreaChart)).toEqual({
      data: revenueSeries,
      animate: false,
    });
    expect(findData(tree, ProjectStatusPie)).toEqual({
      data: statusData,
      animate: false,
    });
  });
});
