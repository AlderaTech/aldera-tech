import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { formatCurrency } from "@/lib/utils";
import { CalculatorSummarySidebar } from "./calculator-summary-sidebar";

type Props = ComponentProps<typeof CalculatorSummarySidebar>;

const defaults: Props = {
  dashboard: true,
  depFields: [],
  depValues: {},
  selectedFeatures: [],
  features: [],
  customFeatures: [],
  selectedAddOns: {},
  addOns: [],
  urgency: "normal",
  config: {
    featureDisclaimer: "",
    revisionPolicy: "",
    freeRevisions: 0,
    revisionPricePerItem: 0,
    urgencyMultiplier: 1.5,
    urgencyThresholdDays: 7,
    dpPercentage: 25,
  },
  total: 0,
};

function render(props: Partial<Props> = {}) {
  return renderToStaticMarkup(
    <CalculatorSummarySidebar {...defaults} {...props} />
  );
}

describe("Empty state Estimasi Biaya dashboard", () => {
  it("menempatkan maskot dekoratif di atas instruksi tanpa total atau DP", () => {
    const html = render();
    expect(html).toContain('id="calculator-estimate"');
    expect(html).toContain("Estimasi Biaya");
    expect(html).toContain("lucide-calculator");
    expect(html).not.toContain("lucide-list-checks");
    expect(html.match(/<img\b/g)).toHaveLength(1);
    expect(html).toContain("aldera-cat-services");
    expect(html).toContain('alt=""');
    expect(html).toContain('sizes="120px"');
    expect(html.indexOf("<img")).toBeLessThan(
      html.indexOf("Pilih jenis proyek pada langkah pertama")
    );
    expect(html).toContain("biaya secara otomatis.");
    expect(html).not.toContain("Total Estimasi");
    expect(html).not.toContain("DP (");
  });

  it("memakai aset WebP transparan yang benar-benar tersedia dan dapat dibaca", async () => {
    const asset = readFileSync(
      new URL(
        "../../../../public/images/services/aldera-cat-services.webp",
        import.meta.url
      )
    );
    const metadata = await sharp(asset).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.hasAlpha).toBe(true);
    expect(metadata.width).toBeGreaterThan(120);
    expect(metadata.height).toBeGreaterThan(120);
  });

  it("menggantikan empty state dengan rincian, total, dan DP asli setelah dipilih", () => {
    const html = render({
      pt: {
        id: "type-test",
        name: "Proyek uji",
        slug: "proyek-uji",
        description: null,
        basePrice: 5000000,
        icon: "Layers",
        dependentFields: [],
        order: 0,
      },
      total: 5000000,
    });
    expect(html).toContain("Base (Proyek uji)");
    expect(html).toContain(formatCurrency(5000000));
    expect(html).toContain("DP (25%)");
    expect(html).toContain(formatCurrency(1250000));
    expect(html).not.toContain("<img");
    expect(html).not.toContain("Pilih jenis proyek pada langkah pertama");
    expect(html).toContain("lucide-calculator");
  });

  it("mempertahankan empty state publik tanpa maskot tambahan", () => {
    for (const studio of [false, true]) {
      const html = render({ dashboard: false, studio });
      expect(html).not.toContain("<img");
      expect(html).not.toContain('id="calculator-estimate"');
      expect(html).toContain("Pilih jenis proyek pada langkah pertama");
      expect(html).toContain("Total Estimasi");
    }
  });

  it("menjaga susunan vertikal rata tengah dengan gambar 120px dan jarak 16px", () => {
    const css = readFileSync(
      new URL("./calculator-dashboard.module.css", import.meta.url),
      "utf8"
    );
    const empty = css.match(/\.summaryEmpty \{([^}]+)\}/)?.[1];
    const mascot = css.match(/\.summaryMascot \{([^}]+)\}/)?.[1];
    expect(empty).toContain("display: grid;");
    expect(empty).toContain("place-items: center;");
    expect(empty).toContain("gap: 1rem;");
    expect(empty).toContain("text-align: center;");
    expect(empty).not.toMatch(/(?:min-)?height:/);
    expect(mascot).toContain("width: 7.5rem;");
    expect(mascot).toContain("height: 7.5rem;");
  });
});
