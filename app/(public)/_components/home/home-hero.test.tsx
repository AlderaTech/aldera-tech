import { expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PUBLIC_ROUTES } from "@/lib/routes";

mock.module("@/components/shared/motion", () => ({
  FadeUp: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
mock.module("./hero-visual", () => ({
  HeroVisual: () => <div aria-hidden="true" />,
}));

const { HomeHero } = await import("./home-hero");

it("renders the landing hero with its project CTA", () => {
  const html = renderToStaticMarkup(<HomeHero />);

  expect(html).toContain("WUJUDKAN SOLUSI DIGITAL.");
  expect(html).toContain(`href="${PUBLIC_ROUTES.contact}"`);
  expect(html).toContain("Mulai Proyek");
});
