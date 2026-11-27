import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
installAdminPageMocks();
const { ProposalCreateForm } = await import("./proposal-create-form");
describe("Form proposal", () => {
  it("mempertahankan batas angka dan label field wajib/opsional", () => {
    const html = renderToStaticMarkup(<ProposalCreateForm />);
    for (const id of [
      "title",
      "clientName",
      "clientEmail",
      "clientPhone",
      "summary",
      "proposal-item-description-0",
      "proposal-item-quantity-0",
      "proposal-item-price-0",
    ]) {
      expect(html).toContain('for="' + id + '"');
      expect(html).toContain('id="' + id + '"');
    }
    expect(html).toContain('min="0.01"');
    expect(html).toContain('min="0"');
    expect(html).toContain("(Opsional)");
    expect(html).toContain("Subtotal");
    expect(html).toContain('type="email"');
    expect(html).toContain("Buat Proposal");
  });
});
