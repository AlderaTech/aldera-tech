import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ProjectListHeader } from "./project-list-header";
import { PUBLIC_ROUTES } from "@/lib/routes";
describe("Banner proyek pengguna", () => {
  it("mempertahankan route CTA, judul, dan badge berikon", () => {
    const html = renderToStaticMarkup(<ProjectListHeader />);
    expect(html).toContain('id="projects-heading"');
    expect(html).toContain('href="' + PUBLIC_ROUTES.calculator + '"');
    expect(html).toContain("data-workspace-banner-badge");
    expect(html).toContain("lucide-folder-kanban");
    expect(html).toContain("data-workspace-banner-visual");
    expect(html).toContain('data-workspace-mascot-pose="projects"');
  });
});
