import { expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PUBLIC_ROUTES, AUTH_ROUTES } from "@/lib/routes";
mock.module("server-only", () => ({}));
mock.module("@/auth", () => ({ signOut: mock(), auth: mock() }));
let pathname: string = PUBLIC_ROUTES.faq;
mock.module("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: mock(), refresh: mock() }),
  useSearchParams: () => new URLSearchParams(),
}));
const { Navbar } = await import("./navbar");
it("preserves navigation, login and mobile menu while sharing the studio navbar", () => {
  for (const path of [PUBLIC_ROUTES.faq, PUBLIC_ROUTES.testimonials]) {
    pathname = path;
    const html = renderToStaticMarkup(<Navbar session={null} />);
    expect(html).toContain("Buka menu");
    expect(html).toContain(AUTH_ROUTES.login);
    expect(html).toContain(PUBLIC_ROUTES.contact);
    expect(html).toContain(PUBLIC_ROUTES.portfolio);
  }
});
