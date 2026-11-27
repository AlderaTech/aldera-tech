import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "@/app/admin/_test-utils/page-mocks";
const ctx = installAdminPageMocks();
const { OrdersContent: Component } = await import("./orders-content");
it("keeps missing data separate from query failure without invented totals", async () => {
  const html = renderToStaticMarkup(await Component());
  expect(html).toContain("Belum ada estimasi");
  ctx
    .query("orderRequest", "count")
    .mockRejectedValueOnce(Error("offline fixture"));
  const failed = renderToStaticMarkup(await Component());
  expect(failed).toContain("Estimasi belum dapat dimuat");
  expect(failed.toLowerCase()).toContain("coba lagi");
  expect(failed).not.toContain("Semua tagihan lunas");
});
