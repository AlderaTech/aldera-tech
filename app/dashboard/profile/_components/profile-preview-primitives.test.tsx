import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { FolderKanban } from "lucide-react";
import {
  DemoBadge,
  PreviewFeedback,
  PreviewPanelHeader,
} from "./profile-preview-primitives";

describe("Komponen dasar preview Profil", () => {
  it("menerima maskot dekoratif tanpa menggandakan ikon header", () => {
    const html = renderToStaticMarkup(
      <PreviewPanelHeader
        id="activity-test"
        title="Aktivitas Terbaru"
        icon={FolderKanban}
        visual={<span aria-hidden="true" data-mascot-visual />}
      />
    );
    expect(html).toContain('data-mascot-visual="true"');
    expect(html).toContain('id="activity-test"');
    expect(html).toContain(">Demo<");
    expect(html).not.toContain("<svg");
  });
  it("menghubungkan judul panel dan label Demo yang terlihat", () => {
    expect(renderToStaticMarkup(<DemoBadge />)).toContain(">Demo<");
    const html = renderToStaticMarkup(
      <PreviewPanelHeader
        id="test-projects-heading"
        title="Seluruh Proyek Saya"
        icon={FolderKanban}
      />
    );
    expect(html).toContain(
      '<h2 id="test-projects-heading">Seluruh Proyek Saya</h2>'
    );
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain(">Demo<");
  });
  it("membedakan skeleton, kosong, dan error dengan status aksesibel", () => {
    const loading = renderToStaticMarkup(
      <PreviewFeedback status="loading" label="Memuat proyek demo" />
    );
    expect(loading).toContain('role="status"');
    expect(loading.match(/data-slot="skeleton"/g)).toHaveLength(12);
    const empty = renderToStaticMarkup(
      <PreviewFeedback status="empty" label="Belum ada proyek demo" />
    );
    expect(empty).toContain('data-preview-state="empty"');
    expect(empty).not.toContain('role="alert"');
    const error = renderToStaticMarkup(
      <PreviewFeedback
        status="error"
        label="Tidak tersedia"
        message="Koneksi gagal"
      />
    );
    expect(error).toContain('role="alert"');
    expect(error).toContain("Koneksi gagal");
    expect(error).not.toContain("Coba lagi");
  });
  it("hanya menampilkan retry ketika callback tersedia", () => {
    expect(
      renderToStaticMarkup(
        <PreviewFeedback
          status="error"
          label="Tidak tersedia"
          onRetry={() => {}}
        />
      )
    ).toContain("Coba lagi");
  });
});
