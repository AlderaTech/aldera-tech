import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DependentFieldsBuilder,
  PROJECT_ICON_OPTIONS,
  ProjectTypeIconPicker,
  parseDependentFields,
} from "./project-type-fields";

describe("ProjectTypeFields studio components", () => {
  it("mem-parsing dependentFields dari JSON mentah secara aman", () => {
    const parsed = parseDependentFields([
      {
        label: "Jumlah Modul",
        type: "number",
        pricePerUnit: 750000,
        unit: "modul",
        min: 1,
        max: 50,
      },
    ]);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.label).toBe("Jumlah Modul");
    expect(parsed[0]?.pricePerUnit).toBe(750000);
    expect(parseDependentFields(null)).toEqual([]);
  });

  it("merender pemilih ikon visual 3D beserta opsi kategori lengkap", () => {
    const html = renderToStaticMarkup(
      <ProjectTypeIconPicker value="code2" onChange={() => {}} />
    );
    expect(html).toContain("Visual &amp; Ikon Kategori");
    expect(html).toContain('name="icon"');
    expect(html).toContain('value="code2"');
    for (const option of PROJECT_ICON_OPTIONS) {
      expect(html).toContain(option.label.replace("&", "&amp;"));
    }
  });

  it("merender builder input dinamis tanpa textarea JSON mentah [] saat kosong maupun terisi", () => {
    const emptyHtml = renderToStaticMarkup(
      <DependentFieldsBuilder fields={[]} onChange={() => {}} />
    );
    expect(emptyHtml).toContain("Tanpa input skala tambahan");
    expect(emptyHtml).toContain("0 parameter");
    expect(emptyHtml).toContain('name="dependentFields"');

    const filledHtml = renderToStaticMarkup(
      <DependentFieldsBuilder
        fields={[
          {
            label: "Jumlah Halaman",
            type: "number",
            pricePerUnit: 500000,
            unit: "halaman",
          },
        ]}
        onChange={() => {}}
      />
    );
    expect(filledHtml).toContain("Input Skala #1");
    expect(filledHtml).toContain("Jumlah Halaman");
    expect(filledHtml).toContain("halaman");
  });
});
