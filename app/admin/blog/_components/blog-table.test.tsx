import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
installAdminPageMocks();
const { BlogTable } = await import("./blog-table");
describe("Empty state artikel admin", () => {
  it("menggunakan ilustrasi dan pesan asli", () => {
    const html = renderToStaticMarkup(<BlogTable posts={[]} />);
    expect(html).toContain("data-admin-empty");
    expect(html).toContain('data-admin-empty-context="blog"');
    expect(html).toContain("Belum ada artikel blog");
  });
});
