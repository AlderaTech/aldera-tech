import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../../_test-utils/page-mocks";
installAdminPageMocks();
const { ProjectOverviewTab } = await import("./overview-tab");
describe("Informasi proyek", () => {
  it("menjaga nilai asli, nama field dan pilihan auto progress", () => {
    const html = renderToStaticMarkup(
      <ProjectOverviewTab
        project={{
          id: "p-ui",
          title: "Judul Panjang Proyek",
          description: "Deskripsi asli",
          status: "IN_PROGRESS",
          progress: 68,
          autoProgress: true,
          deadline: new Date("2026-12-31"),
          budget: "25000000",
        }}
      />
    );
    for (const name of [
      "title",
      "description",
      "status",
      "progress",
      "autoProgress",
      "deadline",
      "budget",
    ])
      expect(html).toContain('name="' + name + '"');
    expect(html).toContain('value="68"');
    expect(html).toContain('value="true"');
    expect(html).toContain('value="25000000"');
    expect(html).toContain("Simpan Perubahan");
    expect(html).toContain("Hapus Proyek");
  });
});
