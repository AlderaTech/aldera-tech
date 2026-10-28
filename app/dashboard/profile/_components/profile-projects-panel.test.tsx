import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { PROFILE_PREVIEW_PROJECTS } from "../_data/profile-preview-data";
import { ProfileProjectsPanel } from "./profile-projects-panel";

describe("Seluruh Proyek Saya — preview lokal", () => {
  it("mempertahankan nama, status, dan progres dari fixture dengan tautan daftar asli", () => {
    const html = renderToStaticMarkup(<ProfileProjectsPanel />);
    for (const project of PROFILE_PREVIEW_PROJECTS) {
      expect(html).toContain(project.name);
      expect(html).toContain(`value="${project.progress}"`);
      expect(html).toContain(`data-status="${project.status}"`);
      expect(html).not.toContain(
        `href="${DASHBOARD_ROUTES.projects}/${project.id}"`
      );
    }
    expect(html.match(/>Lihat Detail</g)).toHaveLength(3);
    expect(html).toContain(`href="${DASHBOARD_ROUTES.projects}"`);
    expect(html).toContain("Bukan daftar proyek akun Anda");
    expect(html).toContain(">Demo<");
  });
  it("membedakan loading, kosong, dan error tanpa menampilkan proyek fixture", () => {
    for (const status of ["loading", "empty", "error"] as const) {
      const resource =
        status === "empty"
          ? { status: "ready" as const, items: [] }
          : status === "error"
            ? { status, message: "Koneksi uji gagal" }
            : { status };
      const html = renderToStaticMarkup(
        <ProfileProjectsPanel resource={resource} />
      );
      expect(html).toContain(`data-preview-state="${status}"`);
      expect(html).not.toContain(PROFILE_PREVIEW_PROJECTS[0].name);
      expect(html).toContain(`href="${DASHBOARD_ROUTES.projects}"`);
    }
  });
  it("membatasi dataset besar dengan jumlah yang jelas dan menangani judul panjang", () => {
    const items = Array.from({ length: 30 }, (_, index) => ({
      ...PROFILE_PREVIEW_PROJECTS[0],
      id: `demo-${index}`,
      name: "Judul proyek panjang ".repeat(12),
    }));
    const html = renderToStaticMarkup(
      <ProfileProjectsPanel resource={{ status: "ready", items }} />
    );
    expect(html.match(/<article/g)).toHaveLength(3);
    expect(html).toContain("Menampilkan 3 dari 30 proyek");
    expect(html).toContain(items[0].name);
  });
});
