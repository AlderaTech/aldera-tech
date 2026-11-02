import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ProjectHeader } from "./project-header";
import { DASHBOARD_ROUTES } from "@/lib/routes";
describe("Banner detail proyek pengguna", () => {
  it("mempertahankan status, progres, nominal, dan navigasi", () => {
    const html = renderToStaticMarkup(
      <ProjectHeader
        title="Portal Uji"
        description="Deskripsi asli"
        status="IN_PROGRESS"
        deadline={null}
        budget={1000000}
        progress={68}
      />
    );
    expect(html).toContain("Portal Uji");
    expect(html).toContain('value="68"');
    expect(html).toContain('href="' + DASHBOARD_ROUTES.projects + '"');
    expect(html).toContain("data-workspace-banner-badge");
    expect(html).toContain("data-workspace-banner-visual");
  });
});
