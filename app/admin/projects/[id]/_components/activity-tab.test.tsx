import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../../_test-utils/page-mocks";
installAdminPageMocks();
const { ActivityTab } = await import("./activity-tab");
describe("Empty state aktivitas proyek", () => {
  it("mempertahankan input pesan dan menempatkan ilustrasi pada daftar kosong", () => {
    const html = renderToStaticMarkup(
      <ActivityTab projectId="project-ui" activities={[]} />
    );
    expect(html).toContain("data-admin-empty");
    expect(html).toContain("Belum ada aktivitas");
    expect(html).toContain("<textarea");
  });
});
