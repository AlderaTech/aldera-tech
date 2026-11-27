import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
import { adminTestProposal } from "../../_test-utils/records";
const context = installAdminPageMocks();
const { default: Page } = await import("./page");
describe("Detail/editor admin proposals/[id]", () => {
  it("menampilkan nilai asli tanpa melakukan mutasi", async () => {
    context
      .query("proposal", "findUnique")
      .mockResolvedValueOnce(adminTestProposal);
    const html = renderToStaticMarkup(
      await Page({ params: Promise.resolve({ id: adminTestProposal.id }) })
    );
    expect(html).toContain("PROP-UI-001");
    expect(html).toContain("PT Pelanggan Uji");
    expect(context.query("proposal", "update")).not.toHaveBeenCalled();
    expect(context.query("proposal", "delete")).not.toHaveBeenCalled();
  });
  it("mempertahankan not-found untuk ID yang tidak tersedia", async () => {
    context.query("proposal", "findUnique").mockResolvedValueOnce(null);
    await expect(
      Page({ params: Promise.resolve({ id: "missing-ui" }) })
    ).rejects.toThrow("notFound");
  });
});
