import { expect, it } from "bun:test";
import { PUBLIC_ROUTES, DASHBOARD_ROUTES, AUTH_ROUTES } from "@/lib/routes";
import { usesStudioPublicChrome } from "./studio-public-routes";

it("keeps FAQ, testimonials, and public detail pages in the same studio theme", () => {
  for (const path of [
    PUBLIC_ROUTES.home,
    PUBLIC_ROUTES.about,
    PUBLIC_ROUTES.faq,
    PUBLIC_ROUTES.testimonials,
    PUBLIC_ROUTES.blog + "/fixture",
    PUBLIC_ROUTES.portfolio + "/fixture",
  ])
    expect(usesStudioPublicChrome(path)).toBe(true);
  for (const path of [DASHBOARD_ROUTES.home, AUTH_ROUTES.login, "/unrelated"])
    expect(usesStudioPublicChrome(path)).toBe(false);
});
