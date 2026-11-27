import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
installAdminPageMocks();
const { ProjectTypesTab } = await import("./project-types-tab");
describe("Empty state jenis proyek", () => {
  it("menampilkan ilustrasi dan tetap mempertahankan formulir konfigurasi", () => {
    const html = renderToStaticMarkup(<ProjectTypesTab items={[]} />);
    expect(html).toContain("data-admin-empty");
    expect(html).toContain("Belum ada jenis proyek");
    expect(html).toContain("<form");
  });
});
