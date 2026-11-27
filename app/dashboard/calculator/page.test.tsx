import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../admin/_test-utils/page-mocks";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { readFileSync } from "node:fs";
installAdminPageMocks();
const { default: Page, metadata } = await import("./page");
describe("Banner kalkulator pengguna", () => {
  it("menjaga metadata, konfigurasi wizard dan tujuan riwayat", async () => {
    const page = await Page();
    const html = renderToStaticMarkup(page);
    expect(metadata.title).toContain("Kalkulator");
    expect(html).toContain("data-workspace-banner-badge");
    expect(html).toContain('data-workspace-mascot-pose="calculator"');
    expect(html).toContain('href="' + DASHBOARD_ROUTES.orders + '"');
    const history = html
      .match(/<a\b[^>]*>/g)
      ?.find((tag) => tag.includes('href="' + DASHBOARD_ROUTES.orders + '"'));
    expect(history).toContain('data-slot="button"');
    expect(html).toContain("lucide-arrow-up-right");
    const css = readFileSync(
      new URL("./_components/calculator-page.module.css", import.meta.url),
      "utf8"
    );
    const button = css.match(/\.history\s*\{([^}]+)\}/)?.[1];
    expect(button).toContain("background: var(--overview-blue);");
    expect(button).toContain("color: var(--overview-paper);");
    expect(button).toContain("border-radius: 999px;");
    expect(page.props.children[1].props.appearance).toBe("dashboard");
    expect(page.props.children[1].props.isAuthenticated).toBe(true);
  });
});
