import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { EmptyStatePattern } from "./empty-state-pattern";

describe("Corak empty state dashboard", () => {
  it("menerima varian kelas lokal tanpa mengubah aksesibilitas dekorasi", () => {
    const pattern = EmptyStatePattern({ className: "overview-accent" });
    expect(pattern.props.className).toContain("overview-accent");
    expect(pattern.props["aria-hidden"]).toBe("true");
    expect(pattern.props.children.props.focusable).toBe("false");
  });

  it("menampilkan SVG dekoratif tanpa kontrol atau urutan fokus tambahan", () => {
    const pattern = EmptyStatePattern();
    expect(pattern.props["aria-hidden"]).toBe("true");
    expect(pattern.props.children.props.focusable).toBe("false");
    const html = renderToStaticMarkup(pattern);
    expect(html).toContain("<svg");
    expect(html).toContain("<path");
    expect(html).not.toMatch(/<(?:button|a|input)\b|tabindex=/i);
  });

  it("tidak menghalangi pointer dan memakai corak statis responsif", () => {
    const css = readFileSync(
      new URL("./empty-state-pattern.module.css", import.meta.url),
      "utf8"
    );
    expect(css).toContain("pointer-events: none;");
    expect(css).toContain("z-index: 0;");
    expect(css).toContain("@media (max-width: 639px)");
    expect(css).not.toMatch(/animation\s*:/);
  });
});
