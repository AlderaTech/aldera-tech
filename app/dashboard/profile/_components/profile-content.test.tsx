import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "@/app/admin/_test-utils/page-mocks";
const ctx = installAdminPageMocks();
const { ProfileContent: Component } = await import("./profile-content");
it("keeps missing data separate from query failure without invented totals", async () => {
  const html = renderToStaticMarkup(await Component({ userId: "fixture" }));
  expect(html).toContain("Profil belum dapat dimuat");
  ctx
    .query("user", "findUnique")
    .mockRejectedValueOnce(Error("offline fixture"));
  const failed = renderToStaticMarkup(await Component({ userId: "fixture" }));
  expect(failed).toContain("Profil belum dapat dimuat");
  expect(failed).toContain("Coba lagi");
  expect(failed).not.toContain("Semua tagihan lunas");
});
