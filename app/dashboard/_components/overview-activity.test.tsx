import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { OverviewActivity } from "./overview-activity";
import { recent } from "./_fixtures/overview";

describe("Aktivitas Ringkasan", () => {
  it("mempertahankan CTA proyek pada keadaan kosong", () => {
    const html = renderToStaticMarkup(<OverviewActivity recent={[]} />);
    expect(html).toContain("Belum ada aktivitas.");
    expect(html).toContain(`href="${DASHBOARD_ROUTES.projects}"`);
  });
  it("menampilkan seluruh enam log asli dengan teks panjang, proyek opsional, dan waktu", () => {
    const description = "PembaruanProyek".repeat(70);
    const logs = Array.from({ length: 6 }, (_, index) => ({
      ...recent[0],
      id: String(index),
      description,
      project: index ? null : recent[0].project,
    }));
    const html = renderToStaticMarkup(<OverviewActivity recent={logs} />);
    expect(html.match(/<time\b/g)).toHaveLength(6);
    expect(html).toContain(description);
    expect(html).toContain(recent[0].project!.title);
    expect(html).toMatch(/datetime="2026-10-21T08:30:00.000Z"/i);
    expect(html).not.toContain("Belum ada aktivitas.");
  });
});
