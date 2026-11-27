import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { FaqHero } from "./faq-hero";
it("uses one accessible studio heading and honest empty description", () => {
  const html = renderToStaticMarkup(<FaqHero />);
  expect(html).toContain("Pertanyaan yang sering ditanyakan");
  expect(html.match(/<h1/g)).toHaveLength(1);
  expect(html).not.toContain("100+");
});
