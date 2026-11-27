import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../_test-utils/page-mocks";
const testContext = installAdminPageMocks();
const { default: Page } = await import("./page");
describe("Antarmuka admin calculator", () => {
  it("merender judul, 4 kartu statistik ringkasan, dan tab penuh dengan sumber data pengujian terisolasi", async () => {
    const html = renderToStaticMarkup(
      await Page({ searchParams: Promise.resolve({ tab: "types" }) })
    );
    expect(html).toContain("Kalkulator Harga");
    expect(html).toContain("data-admin-page-header");
    expect(html.match(/data-admin-stat/g)).toHaveLength(4);
    for (const label of [
      "Jenis Proyek",
      "Fitur Kalkulator",
      "Opsi Add-On",
      "Pengaturan Formula",
      "Tambah Jenis Proyek Baru",
      "Visual &amp; Ikon Kategori",
      "Parameter Skala / Input Dinamis",
    ]) {
      expect(html).toContain(label);
    }
    expect(html).not.toContain("undefined");
  });
  it("tidak menjalankan mutasi ketika halaman dibuka", async () => {
    await Page({ searchParams: Promise.resolve({ tab: "types" }) });
    for (const model of [
      "project",
      "invoice",
      "proposal",
      "blogPost",
      "caseStudy",
      "user",
      "testimonial",
    ]) {
      expect(testContext.query(model, "create")).not.toHaveBeenCalled();
      expect(testContext.query(model, "delete")).not.toHaveBeenCalled();
      expect(testContext.query(model, "update")).not.toHaveBeenCalled();
    }
  });
});
