import { expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PUBLIC_ROUTES } from "@/lib/routes";
const findMany = mock(async () => []);
mock.module("server-only", () => ({}));
mock.module("@/lib/prisma", () => ({ prisma: { caseStudy: { findMany } } }));
const { PortfolioPreview } = await import("./portfolio-preview");
it("does not invent projects when the published query is empty", async () => {
  const html = renderToStaticMarkup(await PortfolioPreview());
  expect(findMany).toHaveBeenCalledWith(
    expect.objectContaining({ where: { published: true }, take: 3 })
  );
  expect(html).toContain("Studi kasus segera hadir");
  expect(html).toContain(PUBLIC_ROUTES.contact);
  expect(html).not.toContain("TechNova");
});
