import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { InvoicesFrame } from "./invoices-frame";

describe("Frame Invoice & Pembayaran", () => {
  it("mempertahankan judul dan konten dengan visual header dekoratif", () => {
    const html = renderToStaticMarkup(
      <InvoicesFrame>
        <p>Konten dinamis invoice</p>
      </InvoicesFrame>
    );
    expect(html).toContain('aria-labelledby="invoices-heading"');
    expect(html).toContain('id="invoices-heading"');
    expect(html).toContain("Invoice &amp; Pembayaran");
    expect(html).toContain("Pantau tagihan, unduh invoice");
    expect(html).toContain("Konten dinamis invoice");
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toMatch(/<(?:button|input|a)\b/);
  });

  it("membatasi kontras dan corak ke stylesheet invoice", () => {
    const css = readFileSync(
      new URL("./invoices.module.css", import.meta.url),
      "utf8"
    );
    for (const name of ["summaryCard", "listPanel", "mobileCard"]) {
      const block = css.match(new RegExp("\\." + name + " \\{([^}]+)\\}"))?.[1];
      expect(block).toContain("background: var(--overview-paper);");
      expect(block).toContain("var(--overview-line)");
    }
    expect(css).toContain("var(--overview-ink) 18%");
    expect(css).toContain("pointer-events: none;");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).not.toMatch(/:global|(?:^|\n)(?:body|html)\b/);
  });

  it("membatasi grid, titik, dan garis diagonal ke dekorasi panel", () => {
    const css = readFileSync(
      new URL("./invoices.module.css", import.meta.url),
      "utf8"
    );
    for (const selector of [
      ".header::before",
      ".summaryCard::after",
      ".listHeader::before",
    ])
      expect(css).toContain(selector);
    expect(css).toContain("z-index: -1;");
    expect(css).toContain("pointer-events: none;");
    expect(css).toContain("var(--summary-accent) 20%");
    expect(css).toContain("mask-image:");
    expect(css).not.toMatch(/animation\s*:|background-attachment:\s*fixed/);
  });
});
