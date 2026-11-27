import { expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PUBLIC_ROUTES } from "@/lib/routes";
let pathname: string = PUBLIC_ROUTES.faq;
mock.module("next/navigation", () => ({ usePathname: () => pathname }));
const { PublicShell } = await import("./public-shell");
it("keeps FAQ and testimonials on the studio theme with content order intact", () => {
  for (const path of [PUBLIC_ROUTES.faq, PUBLIC_ROUTES.testimonials]) {
    pathname = path;
    const html = renderToStaticMarkup(
      <PublicShell
        navbar={<nav>Menu fixture</nav>}
        footer={<footer>Footer fixture</footer>}
      >
        <h1>Isi fixture</h1>
      </PublicShell>
    );
    expect(html).toContain("<main");
    expect(html.indexOf("Menu fixture")).toBeLessThan(
      html.indexOf("Isi fixture")
    );
    expect(html.indexOf("Isi fixture")).toBeLessThan(
      html.indexOf("Footer fixture")
    );
  }
});
