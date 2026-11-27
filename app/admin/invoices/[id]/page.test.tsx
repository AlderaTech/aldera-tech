import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
import { adminTestInvoice } from "../../_test-utils/records";
const context = installAdminPageMocks();
const { default: Page } = await import("./page");
describe("Detail/editor admin invoices/[id]", () => {
  it("menampilkan nilai asli tanpa melakukan mutasi", async () => {
    context
      .query("invoice", "findUnique")
      .mockResolvedValueOnce(adminTestInvoice);
    const html = renderToStaticMarkup(
      await Page({ params: Promise.resolve({ id: adminTestInvoice.id }) })
    );
    expect(html).toContain("INV-UI-001");
    expect(html).toContain("Catatan invoice asli");
    expect(context.query("invoice", "update")).not.toHaveBeenCalled();
    expect(context.query("invoice", "delete")).not.toHaveBeenCalled();
  });
  it("mempertahankan not-found untuk ID yang tidak tersedia", async () => {
    context.query("invoice", "findUnique").mockResolvedValueOnce(null);
    await expect(
      Page({ params: Promise.resolve({ id: "missing-ui" }) })
    ).rejects.toThrow("notFound");
  });
});
