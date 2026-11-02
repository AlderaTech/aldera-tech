import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ADMIN_ROUTES } from "@/lib/routes";
import { installAdminPageMocks } from "../../../_test-utils/page-mocks";

const mocks = installAdminPageMocks(ADMIN_ROUTES.blogCategories);
const { CategoryManagement } = await import("./category-management");

describe("Komposisi kategori dan aksi empty state", () => {
  it("meneruskan aksi buat ke empty state hanya sesuai izin tanpa melakukan mutasi saat render", () => {
    for (const canCreate of [true, false]) {
      const html = renderToStaticMarkup(
        <CategoryManagement
          categories={[]}
          permissions={{ canCreate, canEdit: false, canDelete: false }}
        />
      );
      expect(html).toContain('data-admin-empty-context="categories"');
      expect(
        [...html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)].filter(
          (match) => match[0].includes("Kategori Baru")
        ).length
      ).toBe(canCreate ? 2 : 0);
    }
    expect(mocks.query("blogCategory", "create")).not.toHaveBeenCalled();
  });
});
