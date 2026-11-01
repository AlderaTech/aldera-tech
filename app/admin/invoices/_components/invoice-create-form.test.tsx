import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
import { formatCurrency } from "@/lib/utils";
installAdminPageMocks();
const { InvoiceCreateForm } = await import("./invoice-create-form");
describe("Form invoice admin", () => {
  it("menghubungkan label client, proyek, tanggal dan setiap item tanpa mengubah nilai awal", () => {
    const html = renderToStaticMarkup(
      <InvoiceCreateForm clients={[]} projects={[]} />
    );
    for (const id of [
      "invoice-client",
      "invoice-project",
      "issueDate",
      "dueDate",
      "invoice-item-description-0",
      "invoice-item-quantity-0",
      "invoice-item-price-0",
    ]) {
      expect(html).toContain('for="' + id + '"');
      expect(html).toContain('id="' + id + '"');
    }
    expect(html).toContain("(Opsional)");
    expect(html).toContain('value="11"');
    expect(html).toContain('step="0.01"');
    expect(html).toContain('value="1"');
    expect(html).toContain("Subtotal");
    expect(html).toContain(formatCurrency(0));
  });
  it("tetap memakai client dan proyek dari sumber yang diterima", () => {
    const html = renderToStaticMarkup(
      <InvoiceCreateForm
        clients={[
          {
            id: "client-ui",
            name: "Nama Client Panjang Untuk Pemeriksaan",
            email: "client@example.test",
          },
        ]}
        projects={[]}
      />
    );
    expect(html).toContain('aria-required="true"');
    expect(html).toContain("Pilih client");
    expect(html).toContain("Tambah Item");
    expect(html).toContain('aria-label="Hapus item"');
  });
});
