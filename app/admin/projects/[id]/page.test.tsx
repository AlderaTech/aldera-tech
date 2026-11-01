import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
import { adminTestProject } from "../../_test-utils/records";
const context = installAdminPageMocks();
const { default: Page } = await import("./page");
describe("Detail/editor admin projects/[id]", () => {
  it("menampilkan nilai asli tanpa melakukan mutasi", async () => {
    context
      .query("project", "findUnique")
      .mockResolvedValueOnce(adminTestProject);
    const html = renderToStaticMarkup(
      await Page({ params: Promise.resolve({ id: adminTestProject.id }) })
    );
    expect(html).toContain("Portal Bisnis Uji");
    expect(html).toContain("68");
    expect(context.query("project", "update")).not.toHaveBeenCalled();
    expect(context.query("project", "delete")).not.toHaveBeenCalled();
  });
  it("mempertahankan not-found untuk ID yang tidak tersedia", async () => {
    context.query("project", "findUnique").mockResolvedValueOnce(null);
    await expect(
      Page({ params: Promise.resolve({ id: "missing-ui" }) })
    ).rejects.toThrow("notFound");
  });
});
