import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
installAdminPageMocks();
const { AddOnsTab } = await import("./add-ons-tab");
describe("Empty state add-on", () => {
  it("menjaga formulir dan pesan ketika daftar kosong", () => {
    const html = renderToStaticMarkup(<AddOnsTab items={[]} />);
    expect(html).toContain("data-admin-empty");
    expect(html).toContain("Belum ada opsi tambahan");
    expect(html).toContain("<form");
  });
});
