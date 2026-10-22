import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { OverviewProjects } from "./overview-projects";
import { projects } from "./_fixtures/overview";

describe("Proyek terbaru Ringkasan", () => {
  it("menampilkan empty state ringkas dengan CTA estimasi yang sama", () => {
    const html = renderToStaticMarkup(<OverviewProjects projects={[]} />);
    expect(html).toContain("Belum ada proyek aktif.");
    expect(html).toContain(`href="${PUBLIC_ROUTES.calculator}"`);
    expect(html).toContain(`href="${DASHBOARD_ROUTES.projects}"`);
  });
  it("mempertahankan judul, status, progres, milestone, tanggal, serta tautan detail", () => {
    const html = renderToStaticMarkup(<OverviewProjects projects={projects} />);
    expect(html).toContain(projects[0].title);
    expect(html).toContain("43%");
    expect(html).toContain('value="43"');
    expect(html).toContain(projects[0].milestones[0].title);
    expect(html).toMatch(/datetime="2026-10-21T08:30:00.000Z"/i);
    expect(html).toContain(DASHBOARD_ROUTES.projectDetail(projects[0].id));
    expect(html).not.toContain("Belum ada proyek aktif.");
  });
  it("menjaga judul panjang dan progres nol tanpa mengarang milestone", () => {
    const title = "JudulProyek".repeat(90);
    const html = renderToStaticMarkup(
      <OverviewProjects
        projects={[{ ...projects[0], title, progress: 0, milestones: [] }]}
      />
    );
    expect(html).toContain(title);
    expect(html).toContain('value="0"');
    expect(html).not.toContain("Berikutnya:");
  });
});
