import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../../_test-utils/page-mocks";
import { adminTestPost } from "../../../_test-utils/records";
const context = installAdminPageMocks();
const { default: Page } = await import("./page");
describe("Detail/editor admin blog/[id]/edit", () => {
  it("menampilkan nilai asli tanpa melakukan mutasi", async () => {
    context
      .query("blogPost", "findUnique")
      .mockResolvedValueOnce(adminTestPost);
    const html = renderToStaticMarkup(
      await Page({ params: Promise.resolve({ id: adminTestPost.id }) })
    );
    expect(html).toContain("Edit Post");
    expect(html).toContain("Judul Artikel Asli");
    expect(context.query("blogPost", "update")).not.toHaveBeenCalled();
    expect(context.query("blogPost", "delete")).not.toHaveBeenCalled();
  });
  it("mempertahankan not-found untuk ID yang tidak tersedia", async () => {
    context.query("blogPost", "findUnique").mockResolvedValueOnce(null);
    await expect(
      Page({ params: Promise.resolve({ id: "missing-ui" }) })
    ).rejects.toThrow("notFound");
  });
});
