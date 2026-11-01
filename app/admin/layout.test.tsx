import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "./_test-utils/page-mocks";
import { ADMIN_ROUTES, AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
const context = installAdminPageMocks();
const { default: AdminLayout } = await import("./layout");
describe("Layout admin", () => {
  it("menggunakan navigasi sesuai permission serta scope terpisah tanpa breadcrumb header", async () => {
    const html = renderToStaticMarkup(
      await AdminLayout({ children: <p>Konten pengujian</p> })
    );
    expect(html).toContain("data-admin-workspace");
    expect(html).toContain("data-admin-sidebar");
    expect(html).toContain("data-admin-content");
    expect(html).toContain("Konten pengujian");
    expect(html).toContain("Admin");
    expect(html).not.toContain('aria-label="Breadcrumb admin"');
  });
  it("membersihkan style breadcrumb yang sudah tidak digunakan pada chrome admin", () => {
    const css = readFileSync(
      new URL("./_components/admin-chrome.module.css", import.meta.url),
      "utf8"
    );
    expect(css).not.toContain(".breadcrumb");
    expect(css).not.toContain(".adminLabel");
  });
  it("tetap menolak pengunjung tanpa session dan role client", async () => {
    context.getSession.mockResolvedValueOnce(null);
    await expect(AdminLayout({ children: null })).rejects.toThrow(
      AUTH_ROUTES.loginWithCallback(ADMIN_ROUTES.home)
    );
    context.getSession.mockResolvedValueOnce({
      ...context.session,
      user: { ...context.session.user, role: "CLIENT", roles: ["CLIENT"] },
    });
    await expect(AdminLayout({ children: null })).rejects.toThrow(
      DASHBOARD_ROUTES.home
    );
  });
});
