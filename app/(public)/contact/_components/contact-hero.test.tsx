import { expect, it } from "bun:test";
import { requests } from "@/app/_test-utils/image-quality";
import { renderToStaticMarkup } from "react-dom/server";
import config from "@/next.config";
import { PUBLIC_ROUTES } from "@/lib/routes";
const { ContactHero } = await import("./contact-hero");
it("keeps the response time and contact anchor while using supported image quality", () => {
  const html = renderToStaticMarkup(
    <ContactHero responseTime="waktu fixture" />
  );
  expect(html).toContain("waktu fixture");
  expect(html).toContain(PUBLIC_ROUTES.contact + "#formulir-kontak");
  expect(config.images?.qualities).toContain(Number(requests[0].quality));
});
