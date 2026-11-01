import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { getOverviewStatCards } from "../../_utils/overview-config";
import { formatCurrency } from "@/lib/utils";
import { OverviewStatGrid } from "./overview-stat-grid";

describe("Lima statistik operasional", () => {
  it("menampilkan seluruh nilai sumber, termasuk nol, dengan format rupiah asli", () => {
    for (const revenue of [0, 9876543210]) {
      const html = renderToStaticMarkup(
        <OverviewStatGrid
          stats={getOverviewStatCards({
            total: 38,
            active: 12,
            pending: 8,
            orderPending: 4,
            revenue,
          })}
        />
      );
      expect(html.match(/data-admin-stat/g)).toHaveLength(5);
      for (const title of [
        "Total Proyek",
        "Proyek Aktif",
        "Invoice Pending",
        "Order Pending",
        "Total Revenue",
      ])
        expect(html).toContain(title);
      expect(html).toContain(formatCurrency(revenue).replaceAll("&", "&amp;"));
      expect(html).toContain(">38<");
      expect(html).toContain(">12<");
    }
  });
});
