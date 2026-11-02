import { describe, expect, it, mock } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import {
  ADMIN_EMPTY_CONTEXTS,
  type AdminEmptyContext,
} from "../_data/admin-empty-contexts";
import { AdminEmptyState } from "./admin-empty-state";

describe("Empty state Admin seragam dengan Pengguna", () => {
  it("memakai aset tablet biru asli dengan alpha, bukan maskot atau ikon pengganti", async () => {
    const image = readFileSync(
      new URL(
        "../../../public/images/about/technology/design.webp",
        import.meta.url
      )
    );
    const meta = await sharp(image).metadata();
    expect(meta.hasAlpha).toBe(true);
    expect(meta.width).toBeGreaterThanOrEqual(120);
    const html = renderToStaticMarkup(<AdminEmptyState context="projects" />);
    expect(html).toContain("design");
    expect(html.match(/<img\b/g)).toHaveLength(1);
    expect(html).toContain('alt=""');
    expect(html).toContain('sizes="(max-width: 639px) 104px, 120px"');
    expect(html).not.toContain("data-admin-mascot");
    expect(html).not.toContain("lucide-inbox");
  });
  it("menjaga urutan ilustrasi, label kategori, judul, deskripsi dan aksi pada seluruh konteks", () => {
    for (const context of Object.keys(
      ADMIN_EMPTY_CONTEXTS
    ) as AdminEmptyContext[]) {
      const preset = ADMIN_EMPTY_CONTEXTS[context];
      const html = renderToStaticMarkup(
        <AdminEmptyState
          context={context}
          action={<button>Lanjutkan</button>}
        />
      );
      const label = preset.label.replaceAll("&", "&amp;");
      expect(html.indexOf("<img")).toBeLessThan(html.indexOf(label));
      expect(html.indexOf(label)).toBeLessThan(html.indexOf("<h3"));
      expect(html).toContain(preset.title);
      expect(html).toContain(preset.description);
      expect(html.indexOf(preset.description)).toBeLessThan(
        html.indexOf("<button")
      );
      expect(html).toContain('data-admin-empty-context="' + context + '"');
    }
  });
  it("mempertahankan konten khusus, callback dan disabled tanpa membuat aksi yang tidak tersedia", () => {
    const onClick = mock();
    const action = (
      <button onClick={onClick} disabled>
        Coba lagi
      </button>
    );
    const node = AdminEmptyState({
      title: "Judul panjang ".repeat(30),
      description: "Pesan khusus",
      label: "STATUS HALAMAN",
      action,
    });
    const html = renderToStaticMarkup(node);
    expect(html).toContain("STATUS HALAMAN");
    expect(html).toContain("Pesan khusus");
    expect(html).toContain("disabled");
    expect(onClick).not.toHaveBeenCalled();
    expect(node.props.children[3].props.children).toBe(action);
    expect(renderToStaticMarkup(<AdminEmptyState />)).not.toContain("<button");
  });
  it("memakai dekorasi bersama, lebar deskripsi terkontrol dan aksi pill tanpa bingkai ganda", () => {
    const css = readFileSync(
      new URL("./admin-common.module.css", import.meta.url),
      "utf8"
    );
    expect(css).toContain("max-width: 28rem");
    expect(css).toContain("justify-items: center");
    expect(css).toContain("background: var(--overview-paper)");
    expect(css).toContain("border-radius: 999px");
    expect(css).toContain(".empty .emptyAction :is(a, button)");
    const surfaces = readFileSync(
      new URL("./admin-surfaces.module.css", import.meta.url),
      "utf8"
    );
    expect(surfaces.indexOf("td:has(> [data-admin-empty])")).toBeGreaterThan(
      surfaces.indexOf(".scope :is(th, td):last-child")
    );
    expect(surfaces).toContain(":has([data-admin-empty])::before");
    const html = renderToStaticMarkup(<AdminEmptyState context="invoices" />);
    expect(html).toContain('viewBox="0 0 260 260"');
    expect(html).toContain('aria-hidden="true"');
  });
});
