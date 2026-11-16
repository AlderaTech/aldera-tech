import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { OverviewCharts } from "./overview-charts";

describe("Visualisasi Chart Ringkasan (Donut & Bar Chart)", () => {
  it("menampilkan Donut Chart distribusi milestone dan Bar Chart pembayaran invoice", () => {
    const html = renderToStaticMarkup(
      <OverviewCharts
        active={2}
        spent={23750000}
        work={{ completed: 3, active: 2, pending: 2 }}
        payments={{ paid: 2, waiting: 1, verification: 0 }}
      />
    );
    expect(html).toContain("Distribusi Status Milestone &amp; Tugas");
    expect(html).toContain("Ringkasan Pembayaran Invoice");
    expect(html).toContain("Selesai");
    expect(html).toContain("Berjalan");
    expect(html).toContain("Menunggu");
    expect(html).toContain("43%");
    expect(html).toContain("1 Tagihan");
    expect(html).toContain("2 Proyek");
    expect(html).toContain(`href="${DASHBOARD_ROUTES.projects}"`);
    expect(html).toContain(`href="${DASHBOARD_ROUTES.invoices}"`);
  });

  it("menangani kondisi data kosong (0 proyek dan 0 pembayaran) dengan aman", () => {
    const html = renderToStaticMarkup(
      <OverviewCharts
        active={0}
        spent={0}
        work={{ completed: 0, active: 0, pending: 0 }}
        payments={{ paid: 0, waiting: 0, verification: 0 }}
      />
    );
    expect(html).toContain("0%");
    expect(html).toContain("Belum ada invoice terbit.");
    expect(html).not.toContain("Semua lunas");
    expect(html).toContain("0 Proyek");
  });
});
