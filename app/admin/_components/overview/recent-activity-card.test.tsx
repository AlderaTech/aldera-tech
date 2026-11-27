import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { RecentActivityCard } from "./recent-activity-card";
import { ADMIN_ROUTES } from "@/lib/routes";
describe("Aktivitas admin", () => {
  it("menampilkan kondisi kosong tanpa aktivitas contoh", () => {
    expect(
      renderToStaticMarkup(<RecentActivityCard activities={[]} />)
    ).toContain("Belum ada aktivitas");
  });
  it("mempertahankan batas enam, deskripsi panjang, pelaku, waktu dan route proyek", () => {
    const description = "Deskripsi pengujian ".repeat(25);
    const activities = Array.from({ length: 20 }, (_, i) => ({
      id: "a-" + i,
      description,
      createdAt: new Date("2026-10-28T03:00:00Z"),
      user: { name: "Pengguna Uji" },
      project: { id: "p-" + i, title: "Proyek Uji" },
    }));
    const html = renderToStaticMarkup(
      <RecentActivityCard activities={activities} />
    );
    expect(html.match(/Pengguna Uji/g)).toHaveLength(6);
    expect(html).toContain(description);
    expect(html).toContain(`href="${ADMIN_ROUTES.projectDetail("p-0")}"`);
    expect(html).not.toContain('p-6"');
  });
});
