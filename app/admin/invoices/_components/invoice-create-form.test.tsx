import { describe, it, expect, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
mock.module("next/navigation", () => ({
  useRouter: () => ({ push: mock(), refresh: mock() }),
}));
mock.module("@/lib/actions/invoice", () => ({ createInvoiceAction: mock() }));
const { InvoiceCreateForm } = await import("./invoice-create-form");
describe("Explicit invoice purpose", () => {
  it("renders a labeled purpose selector and retains client, dates and item fields", () => {
    const html = renderToStaticMarkup(
      <InvoiceCreateForm clients={[]} projects={[]} />
    );
    expect(html).toContain("Tujuan tagihan");
    expect(html).toContain('id="invoice-purpose"');
    expect(html).toContain('id="invoice-client"');
    expect(html).toContain("Tanggal");
  });
});
