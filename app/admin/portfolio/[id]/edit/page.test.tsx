import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../../_test-utils/page-mocks";
import { adminTestCaseStudy } from "../../../_test-utils/records";
const context = installAdminPageMocks();
const { default: Page } = await import("./page");
describe("Detail/editor admin portfolio/[id]/edit", () => {
  it("menampilkan nilai asli tanpa melakukan mutasi", async () => {
    context
      .query("caseStudy", "findUnique")
      .mockResolvedValueOnce(adminTestCaseStudy);
    const html = renderToStaticMarkup(
      await Page({ params: Promise.resolve({ id: adminTestCaseStudy.id }) })
    );
    expect(html).toContain("Edit Studi Kasus");
    expect(html).toContain("Studi Kasus Asli");
    expect(context.query("caseStudy", "update")).not.toHaveBeenCalled();
    expect(context.query("caseStudy", "delete")).not.toHaveBeenCalled();
  });
  it("mempertahankan not-found untuk ID yang tidak tersedia", async () => {
    context.query("caseStudy", "findUnique").mockResolvedValueOnce(null);
    await expect(
      Page({ params: Promise.resolve({ id: "missing-ui" }) })
    ).rejects.toThrow("notFound");
  });
});
