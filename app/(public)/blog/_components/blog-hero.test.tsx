import { expect, it } from "bun:test";
import { requests } from "@/app/_test-utils/image-quality";
import { renderToStaticMarkup } from "react-dom/server";
import config from "@/next.config";
const { BlogHero } = await import("./blog-hero");
it("renders an accessible heading and a configured mascot image quality", () => {
  const html = renderToStaticMarkup(<BlogHero />);
  expect(html).toContain('id="blog-heading"');
  expect(requests).toHaveLength(1);
  expect(config.images?.qualities).toContain(Number(requests[0].quality));
});
