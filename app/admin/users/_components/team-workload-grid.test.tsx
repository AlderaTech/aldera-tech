import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
installAdminPageMocks();
const { TeamWorkloadGrid } = await import("./team-workload-grid");
describe("Empty state beban kerja staf", () => {
  it("menampilkan ilustrasi tanpa kapasitas atau anggota contoh", () => {
    const html = renderToStaticMarkup(<TeamWorkloadGrid staff={[]} />);
    expect(html).toContain("data-admin-empty");
    expect(html).toContain("Belum ada anggota tim aktif");
    expect(html).toContain('data-admin-empty-context="workload"');
  });
});
