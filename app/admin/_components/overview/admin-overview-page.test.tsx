import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminOverviewPage } from "./admin-overview-page";
import { getOverviewStatCards } from "../../_utils/overview-config";

describe("Susunan dashboard operasional", () => {
  it("mempertahankan semua panel dan data kosong tanpa statistik buatan", () => {
    const html = renderToStaticMarkup(
      <AdminOverviewPage
        statCards={getOverviewStatCards({
          total: 0,
          active: 0,
          pending: 0,
          orderPending: 0,
          revenue: 0,
        })}
        quickActions={[]}
        operationalCards={[]}
        analytics={{ revenueSeries: [], statusData: [], clientsData: [] }}
        recent={[]}
      />
    );
    for (const label of [
      "Dashboard operasional",
      "Revenue 12 Bulan",
      "Status Proyek",
      "Top 5 Client",
      "Aktivitas Terbaru",
      "Panel Operasional",
    ])
      expect(html).toContain(label);
    expect(html.match(/data-admin-stat/g)).toHaveLength(5);
  });

  it("memberikan padding eksplisit pada setiap CardHeader panel dan menjaga selector CSS permukaan bebas dari :is(> ...) invalid", () => {
    const html = renderToStaticMarkup(
      <AdminOverviewPage
        statCards={getOverviewStatCards({
          total: 1,
          active: 1,
          pending: 0,
          orderPending: 0,
          revenue: 1000000,
        })}
        quickActions={[]}
        operationalCards={[]}
        analytics={{ revenueSeries: [], statusData: [], clientsData: [] }}
        recent={[]}
      />
    );
    const headerMatches =
      html.match(/data-slot="card-header"[^>]*px-5 py-3\.5/g) ?? [];
    expect(headerMatches).toHaveLength(5);

    const surfacesCss = readFileSync(
      resolve(import.meta.dir, "../admin-surfaces.module.css"),
      "utf8"
    );
    expect(surfacesCss).not.toMatch(/:is\(\s*>/);
  });
});
