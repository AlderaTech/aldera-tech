import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
import { ADMIN_ROUTES } from "@/lib/routes";
installAdminPageMocks();
const { InvoiceTable } = await import("./invoice-table");
describe("Empty state daftar invoice admin", () => {
  it("mengikuti status resmi walaupun tanggal jatuh tempo sudah lewat", () => {
    for (const [status, label] of [
      ["SENT", "Terkirim"],
      ["PENDING_VERIFICATION", "Menunggu Verifikasi"],
      ["OVERDUE", "Lewat Jatuh Tempo"],
    ] as const) {
      const html = renderToStaticMarkup(
        <InvoiceTable
          invoices={[
            {
              id: "invoice-status",
              number: "INV-STATUS",
              status,
              total: "1250000",
              dueDate: new Date("2020-01-01T00:00:00Z"),
              client: { name: "Klien Uji" },
              project: null,
            },
          ]}
        />
      );
      expect(html).toContain(label);
      expect(html).not.toContain(">Overdue<");
      expect(html).toContain("INV-STATUS");
    }
  });
  it("menampilkan ilustrasi sebelum teks dan mempertahankan struktur tabel", () => {
    const html = renderToStaticMarkup(<InvoiceTable invoices={[]} />);
    expect(html).toContain("data-admin-empty");
    expect(html.indexOf("<img")).toBeLessThan(
      html.indexOf("Belum ada invoice")
    );
    expect(html).toContain("<tbody");
  });
  it("mempertahankan nilai, status, tautan detail dan pagination dari data asli", () => {
    const html = renderToStaticMarkup(
      <InvoiceTable
        invoices={[
          {
            id: "i-ui",
            number: "INV-UI",
            status: "PAID",
            total: "1110000",
            dueDate: new Date("2026-11-02"),
            client: { name: "Client Uji" },
            project: null,
          },
        ]}
        totalItems={500}
        currentPage={2}
        pageSize={10}
      />
    );
    expect(html).toContain("INV-UI");
    expect(html).toContain('href="' + ADMIN_ROUTES.invoiceDetail("i-ui") + '"');
    expect(html).toContain("500");
    expect(html).not.toContain("data-admin-empty");
  });
});
