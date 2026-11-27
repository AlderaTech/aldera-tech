import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../../_test-utils/page-mocks";
installAdminPageMocks();
const { RecurringTemplateForm } = await import("./recurring-form");
describe("Template invoice berkala", () => {
  it("mempertahankan jadwal, tarif dan input dengan label terlihat", () => {
    const html = renderToStaticMarkup(
      <RecurringTemplateForm clients={[]} projects={[]} />
    );
    for (const id of [
      "name",
      "recurring-client",
      "recurring-project",
      "recurring-frequency",
      "recurring-next-issue",
      "recurring-due-days",
      "recurring-tax",
      "recurring-item-description-0",
      "recurring-item-quantity-0",
      "recurring-item-price-0",
      "notes",
    ]) {
      expect(html).toContain('for="' + id + '"');
      expect(html).toContain('id="' + id + '"');
    }
    expect(html).toContain('value="14"');
    expect(html).toContain('value="11"');
    expect(html).toContain("Total per periode");
    expect(html).toContain("(Opsional)");
    expect(html).toContain('aria-required="true"');
  });
});
