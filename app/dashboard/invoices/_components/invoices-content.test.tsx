import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "@/app/admin/_test-utils/page-mocks";
const ctx = installAdminPageMocks();
const { InvoicesContent: Component } = await import("./invoices-content");
it("keeps missing data separate from query failure without invented totals", async () => {
  const html = renderToStaticMarkup(await Component());
  expect(html).toContain("Belum ada invoice");
  ctx.query("invoice", "count").mockRejectedValueOnce(Error("offline fixture"));
  const failed = renderToStaticMarkup(await Component());
  expect(failed).toContain("Invoice belum dapat dimuat");
  expect(failed.toLowerCase()).toContain("coba lagi");
  expect(failed).not.toContain("Semua tagihan lunas");
});
