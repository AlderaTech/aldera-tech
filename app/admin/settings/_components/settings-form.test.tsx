import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { defaultSiteSettings } from "@/lib/public-settings";

mock.module("server-only", () => ({}));

let currentSearchParams = new URLSearchParams();
function setSearchParams(query: string = "") {
  currentSearchParams = new URLSearchParams(query);
  (
    globalThis as unknown as { __mockSearchParams?: URLSearchParams }
  ).__mockSearchParams = currentSearchParams;
}

const redirect = mock((path: string): never => {
  throw new Error(`redirect:${path}`);
});
const notFound = mock((): never => {
  throw new Error("notFound");
});

mock.module("next/navigation", () => ({
  redirect,
  notFound,
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/settings",
  useSearchParams: () => currentSearchParams,
}));

mock.module("@/lib/actions/settings", () => ({
  updateSiteSettingsAction: mock(),
}));

const { SettingsForm } = await import("./settings-form");

describe("SettingsForm UI Component", () => {
  it("renders profile and contact tabs triggers", () => {
    setSearchParams();
    const html = renderToStaticMarkup(
      <SettingsForm settings={defaultSiteSettings} />
    );

    expect(html).toContain("Profil Website");
    expect(html).toContain("Sosial &amp; Kontak");
  });

  it("activates profile tab by default when no ?tab= query param is provided", () => {
    setSearchParams();
    const html = renderToStaticMarkup(
      <SettingsForm settings={defaultSiteSettings} />
    );

    expect(html).toContain('data-state="active"');
    expect(html).toContain("Profil Website");
    expect(html).toContain("Identitas brand");
  });

  it("activates contact tab when ?tab=contact is in the URL query params", () => {
    setSearchParams("tab=contact");
    const html = renderToStaticMarkup(
      <SettingsForm settings={defaultSiteSettings} />
    );

    expect(html).toContain('data-state="active"');
    expect(html).toContain("Kontak publik");
  });

  it("falls back to profile tab when an unknown ?tab= parameter is provided", () => {
    setSearchParams("tab=unknown-tab");
    const html = renderToStaticMarkup(
      <SettingsForm settings={defaultSiteSettings} />
    );

    expect(html).toContain('data-state="active"');
    expect(html).toContain("Identitas brand");
  });
});
