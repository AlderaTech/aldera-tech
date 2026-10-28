import { describe, expect, it, mock } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import type { Session } from "next-auth";
import { clientNavConfig, getAdminNavConfig } from "@/lib/dashboard-nav";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

let pathname: string = DASHBOARD_ROUTES.home;
mock.module("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: mock(), replace: mock(), refresh: mock() }),
  useSearchParams: () => new URLSearchParams(),
  redirect: (url: string): never => {
    throw new Error(`REDIRECT:${url}`);
  },
  notFound: (): never => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const { DashboardHeader } = await import("./dashboard-header");
const session: Session = {
  user: {
    id: "header-ui-user",
    name: "Pengguna Uji",
    email: "header@example.test",
    image: null,
    role: "CLIENT",
    roles: ["CLIENT"],
  },
  expires: "2027-01-01T00:00:00.000Z",
};

function expectHeaderControls(html: string) {
  expect(html).toContain("<header");
  for (const label of [
    "Buka sidebar",
    "Buka pencarian",
    "Notifikasi",
    "Menu pengguna",
  ]) {
    expect(html).toContain(`aria-label="${label}"`);
  }
}

describe("Header halaman pengguna", () => {
  it("menghapus breadcrumb Workspace di seluruh halaman tanpa menghilangkan kontrol", () => {
    for (const route of [
      DASHBOARD_ROUTES.home,
      DASHBOARD_ROUTES.projects,
      DASHBOARD_ROUTES.orders,
      DASHBOARD_ROUTES.calculator,
      DASHBOARD_ROUTES.aiRelay,
      DASHBOARD_ROUTES.invoices,
      DASHBOARD_ROUTES.profile,
      DASHBOARD_ROUTES.settings,
      DASHBOARD_ROUTES.projectDetail("project-ui-test"),
    ]) {
      pathname = route;
      const html = renderToStaticMarkup(
        <DashboardHeader session={session} navConfig={clientNavConfig} />
      );
      expect(html).not.toContain("Workspace");
      expect(html).not.toContain("<strong>");
      expectHeaderControls(html);
    }
  });

  it("mempertahankan kontrol header admin yang menggunakan komponen bersama", () => {
    pathname = ADMIN_ROUTES.home;
    const html = renderToStaticMarkup(
      <DashboardHeader
        session={{
          ...session,
          user: { ...session.user, role: "ADMIN", roles: ["ADMIN"] },
        }}
        navConfig={getAdminNavConfig("ADMIN")}
      />
    );
    expectHeaderControls(html);
  });

  it("membersihkan style breadcrumb yang sudah tidak digunakan", () => {
    const css = readFileSync(
      new URL("./overview-chrome.module.css", import.meta.url),
      "utf8"
    );
    expect(css).not.toContain(".headerTitle");
    expect(css).toContain(".header button:focus-visible");
  });
});
