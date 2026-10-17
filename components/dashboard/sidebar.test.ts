import { describe, expect, it } from "bun:test";
import { isNavItemActive } from "@/components/dashboard/sidebar";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

describe("Sidebar Navigation Active State (isNavItemActive)", () => {
  const allHrefs = [
    ADMIN_ROUTES.home,
    ADMIN_ROUTES.projects,
    ADMIN_ROUTES.orders,
    ADMIN_ROUTES.calculator,
    ADMIN_ROUTES.blog,
    ADMIN_ROUTES.blogCategories,
    ADMIN_ROUTES.portfolio,
    ADMIN_ROUTES.settings,
    DASHBOARD_ROUTES.home,
    DASHBOARD_ROUTES.projects,
  ];

  it("activates /admin/blog when visiting /admin/blog", () => {
    expect(isNavItemActive("/admin/blog", ADMIN_ROUTES.blog, allHrefs)).toBe(
      true
    );
    expect(
      isNavItemActive("/admin/blog", ADMIN_ROUTES.blogCategories, allHrefs)
    ).toBe(false);
  });

  it("activates /admin/blog/categories exclusively when visiting /admin/blog/categories (NO DOUBLE HIGHLIGHT)", () => {
    // Crucial bug fix verification:
    // /admin/blog should NOT be active when visiting /admin/blog/categories
    expect(
      isNavItemActive("/admin/blog/categories", ADMIN_ROUTES.blog, allHrefs)
    ).toBe(false);

    // /admin/blog/categories SHOULD be active
    expect(
      isNavItemActive(
        "/admin/blog/categories",
        ADMIN_ROUTES.blogCategories,
        allHrefs
      )
    ).toBe(true);
  });

  it("activates /admin/blog for sub-routes like /admin/blog/new or /admin/blog/123/edit", () => {
    expect(
      isNavItemActive("/admin/blog/new", ADMIN_ROUTES.blog, allHrefs)
    ).toBe(true);
    expect(
      isNavItemActive("/admin/blog/new", ADMIN_ROUTES.blogCategories, allHrefs)
    ).toBe(false);

    expect(
      isNavItemActive("/admin/blog/my-post/edit", ADMIN_ROUTES.blog, allHrefs)
    ).toBe(true);
    expect(
      isNavItemActive(
        "/admin/blog/my-post/edit",
        ADMIN_ROUTES.blogCategories,
        allHrefs
      )
    ).toBe(false);
  });

  it("activates /admin/blog/categories for sub-routes of categories", () => {
    expect(
      isNavItemActive("/admin/blog/categories/new", ADMIN_ROUTES.blog, allHrefs)
    ).toBe(false);

    expect(
      isNavItemActive(
        "/admin/blog/categories/new",
        ADMIN_ROUTES.blogCategories,
        allHrefs
      )
    ).toBe(true);
  });

  it("handles home routes with exact match only", () => {
    expect(isNavItemActive("/admin", ADMIN_ROUTES.home, allHrefs)).toBe(true);
    expect(isNavItemActive("/admin/blog", ADMIN_ROUTES.home, allHrefs)).toBe(
      false
    );
    expect(isNavItemActive("/dashboard", DASHBOARD_ROUTES.home, allHrefs)).toBe(
      true
    );
    expect(
      isNavItemActive("/dashboard/projects", DASHBOARD_ROUTES.home, allHrefs)
    ).toBe(false);
  });
});
