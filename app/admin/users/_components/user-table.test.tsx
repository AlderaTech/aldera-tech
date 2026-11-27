import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
installAdminPageMocks();
const { UserTable } = await import("./user-table");
describe("Empty state pengguna admin", () => {
  it("tetap membatasi tindakan berdasarkan permission", () => {
    const html = renderToStaticMarkup(
      <UserTable users={[]} canManageUsers={false} />
    );
    expect(html).toContain("data-admin-empty");
    expect(html).toContain("Belum ada pengguna");
    expect(html).not.toContain("Hapus pengguna");
  });
});
