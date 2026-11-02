import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../_test-utils/page-mocks";
const testContext = installAdminPageMocks();
const { default: Page } = await import("./page");
describe("Antarmuka admin timesheet", () => {
  it("merender judul dan kontrol asli dengan sumber data pengujian terisolasi", async () => {
    const html = renderToStaticMarkup(
      await Page({
        searchParams: Promise.resolve({ from: "2026-10-01", to: "2026-10-28" }),
      })
    );
    expect(html).toContain("Timesheet");
    expect(html).toContain("data-admin-page-header");
    expect(html).toContain("data-timesheet-filters");
    expect(html.indexOf("data-timesheet-filters")).toBeGreaterThan(
      html.indexOf("</header>")
    );
    expect(html).not.toContain("undefined");
  });
  it("tidak menjalankan mutasi ketika halaman dibuka", async () => {
    await Page({
      searchParams: Promise.resolve({ from: "2026-10-01", to: "2026-10-28" }),
    });
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
