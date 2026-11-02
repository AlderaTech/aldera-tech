import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../../_test-utils/page-mocks";
import { adminTestProject } from "../../../_test-utils/records";
const context = installAdminPageMocks();
const { default: Page } = await import("../page");
describe("Banner detail proyek admin", () => {
  it("mempertahankan identitas dan statistik asli", async () => {
    context
      .query("project", "findUnique")
      .mockResolvedValueOnce(adminTestProject);
    const page = await Page({
      params: Promise.resolve({ id: adminTestProject.id }),
    });
    const html = renderToStaticMarkup(page.props.children[0]);
    expect(html).toContain("data-workspace-banner-badge");
    expect(html).toContain(adminTestProject.title);
    expect(html).toContain("68");
    expect(html).toContain("Milestone selesai");
  });
});
