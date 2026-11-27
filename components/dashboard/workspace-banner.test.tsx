import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Network } from "lucide-react";
import { WorkspaceBanner } from "./workspace-banner";
import { WORKSPACE_MASCOT_IMAGES } from "./workspace-mascots";
describe("Banner ruang kerja bersama", () => {
  it("memilih pose per halaman atau gambar kustom tanpa mengubah konten", () => {
    for (const pose of [
      "invoice",
      "calculator",
      "orders",
      "projects",
      "profile",
    ] as const) {
      const html = renderToStaticMarkup(
        <WorkspaceBanner mascotPose={pose}>
          <h1>Judul asli</h1>
        </WorkspaceBanner>
      );
      expect(html).toContain(`data-workspace-mascot-pose="${pose}"`);
      expect(decodeURIComponent(html)).toContain(WORKSPACE_MASCOT_IMAGES[pose]);
      expect(html.match(/<img\b/g)).toHaveLength(1);
      expect(html).toContain('alt=""');
    }
    const custom = renderToStaticMarkup(
      <WorkspaceBanner
        mascotPose="invoice"
        mascotImage={WORKSPACE_MASCOT_IMAGES.orders}
      >
        <h1>Kustom</h1>
      </WorkspaceBanner>
    );
    expect(decodeURIComponent(custom)).toContain(
      WORKSPACE_MASCOT_IMAGES.orders
    );
    expect(decodeURIComponent(custom)).not.toContain(
      WORKSPACE_MASCOT_IMAGES.invoice
    );
    expect(
      renderToStaticMarkup(
        <WorkspaceBanner mascot={false} mascotPose="calculator">
          Tanpa ilustrasi
        </WorkspaceBanner>
      )
    ).not.toContain("<img");
  });
  it("menempatkan badge berikon sebelum judul dan satu maskot dekoratif di kanan", () => {
    const html = renderToStaticMarkup(
      <WorkspaceBanner
        eyebrow="Admin Console"
        badgeIcon={Network}
        aria-labelledby="banner-title"
      >
        <div>
          <h1 id="banner-title">Judul asli</h1>
          <p>Deskripsi asli</p>
        </div>
        <a href="#aksi">Aksi asli</a>
      </WorkspaceBanner>
    );
    expect(html).toContain("data-workspace-banner");
    expect(html).toContain("lucide-network");
    expect(html.indexOf("data-workspace-banner-badge")).toBeLessThan(
      html.indexOf("<h1")
    );
    expect(html.match(/<img\b/g)).toHaveLength(1);
    expect(html).toContain('alt=""');
    expect(html).toContain('aria-labelledby="banner-title"');
    expect(html).toContain('href="#aksi"');
    expect(html).toContain('width="160"');
  });
  it("mempertahankan visual kontekstual dan konten panjang tanpa membuat aksi baru", () => {
    const title = "Judul panjang ".repeat(30);
    const html = renderToStaticMarkup(
      <WorkspaceBanner mascot={<span data-custom-mascot>Visual asli</span>}>
        <h1>{title}</h1>
      </WorkspaceBanner>
    );
    expect(html).toContain(title);
    expect(html).toContain("data-custom-mascot");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<button");
    expect(
      renderToStaticMarkup(
        <WorkspaceBanner mascot={false}>
          <h1>Tanpa visual</h1>
        </WorkspaceBanner>
      )
    ).not.toContain("data-workspace-banner-visual");
  });
});
