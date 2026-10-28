import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PROFILE_PREVIEW_ACTIVITIES } from "../_data/profile-preview-data";
import { ProfileActivityPanel } from "./profile-activity-panel";

describe("Aktivitas Terbaru — pratinjau", () => {
  it("menampilkan aktivitas dan waktu tetap dari fixture, dengan maskot dekoratif pada header panel", () => {
    const html = renderToStaticMarkup(<ProfileActivityPanel />);
    for (const activity of PROFILE_PREVIEW_ACTIVITIES) {
      expect(html).toContain(activity.description);
      expect(html).toContain(`dateTime="${activity.occurredAt}"`);
    }
    expect(html).toContain("WIB");
    expect(html).toContain("belum terhubung");
    expect(html).toContain(">Demo<");
    expect(html).toContain('data-profile-mascot="activity"');
    expect(html).toContain('alt=""');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("aldera-profile-activity.webp");
    expect(html.indexOf("aldera-profile-activity.webp")).toBeLessThan(
      html.indexOf("<ol")
    );
  });
  it("menangani loading, kosong, serta error dengan retry opsional", () => {
    expect(
      renderToStaticMarkup(
        <ProfileActivityPanel resource={{ status: "loading" }} />
      )
    ).toContain('data-preview-state="loading"');
    expect(
      renderToStaticMarkup(
        <ProfileActivityPanel resource={{ status: "ready", items: [] }} />
      )
    ).toContain("Belum ada aktivitas demo");
    const html = renderToStaticMarkup(
      <ProfileActivityPanel
        resource={{ status: "error", message: "Gagal uji" }}
        onRetry={() => {}}
      />
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain("Gagal uji");
    expect(html).toContain("Coba lagi");
  });
  it("membatasi dataset besar tanpa menyembunyikan jumlah preview", () => {
    const items = Array.from({ length: 40 }, (_, index) => ({
      ...PROFILE_PREVIEW_ACTIVITIES[0],
      id: `demo-${index}`,
    }));
    const html = renderToStaticMarkup(
      <ProfileActivityPanel resource={{ status: "ready", items }} />
    );
    expect(html.match(/<time /g)).toHaveLength(5);
    expect(html).toContain("Menampilkan 5 dari 40 aktivitas");
  });
});
