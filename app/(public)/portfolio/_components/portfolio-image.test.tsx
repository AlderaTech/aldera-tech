import { expect, it } from "bun:test";
import { requests } from "@/app/_test-utils/image-quality";
import { renderToStaticMarkup } from "react-dom/server";
import config from "@/next.config";
const { PortfolioImage } = await import("./portfolio-image");
it("distinguishes missing previews and preserves alt/sizing for supplied images", () => {
  const props = {
    alt: "Proyek fixture",
    sizes: "100vw",
    imageClassName: "preview",
    fallbackClassName: "fallback",
  };
  expect(
    renderToStaticMarkup(<PortfolioImage {...props} src={null} />)
  ).toContain("Pratinjau belum tersedia");
  expect(requests).toHaveLength(0);
  const html = renderToStaticMarkup(
    <PortfolioImage {...props} src="/fixture.webp" />
  );
  expect(html).toContain(props.alt);
  expect(requests[0].sizes).toBe("100vw");
  expect(config.images?.qualities).toContain(Number(requests[0].quality));
});
