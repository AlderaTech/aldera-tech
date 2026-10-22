import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { PUBLIC_ROUTES } from "@/lib/routes";
import mascot from "@/public/images/about/aldera-cat-about.webp";
import { ProjectListHeader } from "./project-list-header";
import { ProjectsEmptyState } from "./projects-empty-state";
import { EmptyStatePattern } from "../../_components/empty-state-pattern";

describe("Empty state Proyek Saya", () => {
  it("menempatkan corak teknologi sebagai dekorasi di belakang konten", () => {
    const decoration = ProjectsEmptyState().props.children[2];
    expect(decoration.type).toBe(EmptyStatePattern);
    const html = renderToStaticMarkup(decoration);
    expect(html).toContain("<svg");
    expect(html).toContain("<path");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('focusable="false"');
    expect(html).not.toMatch(/<(?:button|a)\b|tabindex=/i);
    const css = readFileSync(
      new URL(
        "../../_components/empty-state-pattern.module.css",
        import.meta.url
      ),
      "utf8"
    );
    expect(css).toContain("pointer-events: none;");
  });

  it("memisahkan permukaan kartu dari latar melalui gaya khusus empty state", () => {
    const css = readFileSync(
      new URL("./project-list.module.css", import.meta.url),
      "utf8"
    );
    const emptyRule = css.match(/\.statePanel\.emptyPanel\s*\{([^}]+)\}/)?.[1];
    expect(emptyRule).toBeDefined();
    expect(emptyRule).toContain("background: var(--overview-paper);");
    expect(emptyRule).not.toContain("radial-gradient");
    expect(emptyRule).toMatch(/border-color:\s*color-mix/);
    expect(emptyRule).toContain("box-shadow:");
  });

  it("menempatkan maskot sebelum label, judul, dan deskripsi tanpa mengubah teks", () => {
    const html = renderToStaticMarkup(<ProjectsEmptyState />);
    const positions = [
      html.indexOf("<img"),
      html.indexOf("Langkah pertama"),
      html.indexOf("Belum ada proyek"),
      html.indexOf(
        "Hitung estimasi harga dan ajukan proyek Anda melalui kalkulator."
      ),
    ];

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).toContain('aria-labelledby="projects-empty-heading"');
    expect(html).toContain('<h2 id="projects-empty-heading">');
  });

  it("mempertahankan aset dekoratif dan ukuran responsif tanpa menambahkan tindakan", () => {
    const image = ProjectsEmptyState().props.children[0];
    expect(image.props.src).toBe(mascot);
    expect(image.props.alt).toBe("");
    expect(image.props["aria-hidden"]).toBe("true");
    expect(image.props.width).toBe(140);
    expect(image.props.height).toBe(140);
    expect(image.props.sizes).toBe("(min-width: 640px) 140px, 112px");

    const html = renderToStaticMarkup(
      <>
        <ProjectListHeader />
        <ProjectsEmptyState />
      </>
    );
    expect(html.match(/Hitung Estimasi/g)).toHaveLength(1);
    expect(html).toContain(`href="${PUBLIC_ROUTES.calculator}"`);
    expect(html).toContain("Proyek Saya");
  });
});
