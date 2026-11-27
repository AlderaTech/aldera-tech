import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
installAdminPageMocks();
const { ProjectCreateForm } = await import("./project-create-form");
describe("Form proyek baru", () => {
  it("menjaga nama field, required, dan hubungan label dengan input", () => {
    const html = renderToStaticMarkup(<ProjectCreateForm clients={[]} />);
    for (const name of [
      "title",
      "description",
      "clientId",
      "deadline",
      "budget",
    ]) {
      expect(html).toContain('name="' + name + '"');
      expect(html).toContain('for="' + name + '"');
    }
    expect(html).toContain('aria-required="true"');
    expect(html).toContain("(Opsional)");
    expect(html).toContain("Buat Proyek");
    expect(html).toContain('placeholder="Misal: Website E-Commerce"');
  });
});
