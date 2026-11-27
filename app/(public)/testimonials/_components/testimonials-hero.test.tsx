import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { TestimonialsHero } from "./testimonials-hero";
it("uses one accessible studio heading and honest empty description", () => {
  const html = renderToStaticMarkup(<TestimonialsHero count={0} />);
  expect(html).toContain("Kata klien kami");
  expect(html.match(/<h1/g)).toHaveLength(1);
  expect(html).not.toContain("100+");
});
it("keeps the real count", () => {
  expect(renderToStaticMarkup(<TestimonialsHero count={7} />)).toContain(
    "7 testimoni"
  );
});
