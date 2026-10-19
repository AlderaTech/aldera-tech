import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { InvoiceStatus } from "@prisma/client";
import { API_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";
import { invoiceStatusMeta } from "@/lib/status-meta";
import type { ClientInvoiceItem } from "../_types/invoice";

mock.module("@/lib/actions/invoice", () => ({
  submitPaymentProofAction: mock(),
}));
mock.module("@/lib/actions/payment", () => ({
  createInvoicePaymentSnapAction: mock(),
}));
mock.module("next/navigation", () => ({
  useRouter: () => ({ refresh: mock(), replace: mock(), push: mock() }),
  usePathname: () => "/dashboard/invoices",
  useSearchParams: () => new URLSearchParams(),
}));

const { ClientInvoicesTable } = await import("./client-invoices-table");
const { InvoiceDesktopTable } = await import("./invoice-desktop-table");
const { InvoiceMobileCards } = await import("./invoice-mobile-cards");
const { InvoicesSummary } = await import("./invoices-summary");
const { InvoicesSkeleton } = await import("./invoices-skeleton");
const { InvoicesLoadError } = await import("./invoices-load-error");

const statuses: InvoiceStatus[] = [
  "SENT",
  "OVERDUE",
  "PENDING_VERIFICATION",
  "PAID",
  "CANCELLED",
];
const invoices: ClientInvoiceItem[] = statuses.map((status, index) => ({
  id: `invoice-${index}`,
  number: `INV-2026-${index}`,
  status,
  issueDate: new Date("2025-01-01"),
  dueDate: new Date("2025-01-15"),
  total: 1234567.89 + index,
  project: {
    title:
      "Proyek dengan nama panjang untuk memastikan informasi tetap tersedia sepenuhnya",
  },
  paymentProofUrl: status === "PENDING_VERIFICATION" ? "/test-proof.pdf" : null,
}));

describe("Tampilan invoice dan tindakan yang diizinkan", () => {
  for (const View of [InvoiceDesktopTable, InvoiceMobileCards]) {
    it(`${View.name}: nominal, status resmi, nomor PDF, dan izin tindakan tetap sesuai data`, () => {
      const html = renderToStaticMarkup(
        <View invoices={invoices} onPay={mock()} />
      );
      for (const invoice of invoices) {
        expect(html).toContain(invoice.number);
        expect(html).toContain(formatCurrency(invoice.total));
        expect(html).toContain(invoiceStatusMeta[invoice.status].label);
        expect(html).toContain(API_ROUTES.invoicePdf(invoice.id));
        expect(html).toContain(`Unduh PDF ${invoice.number}`);
        expect(html).toContain(invoice.project!.title);
      }
      expect(html).toContain("Bayar Tagihan INV-2026-0");
      expect(html).toContain("Bayar Tagihan INV-2026-1");
      expect(html).toContain("Lihat Bukti INV-2026-2");
      expect(html).not.toContain("Bayar Tagihan INV-2026-3");
      expect(html).not.toContain("Bayar Tagihan INV-2026-4");
      // SENT dengan tanggal lampau tidak diganti menjadi OVERDUE oleh browser.
      expect((html.match(/data-status="SENT"/g) ?? []).length).toBe(1);
      expect((html.match(/data-status="OVERDUE"/g) ?? []).length).toBe(1);
      expect((html.match(/ download=""/g) ?? []).length).toBe(invoices.length);
    });
  }
  it("membedakan kosong dari kegagalan dan menyediakan navigasi yang tersedia", () => {
    const empty = renderToStaticMarkup(<ClientInvoicesTable invoices={[]} />);
    expect(empty).toContain("Belum ada invoice");
    expect(empty).toContain(`href="${DASHBOARD_ROUTES.projects}"`);
    expect(empty).not.toContain("Semua tagihan lunas");
    const error = renderToStaticMarkup(<InvoicesLoadError />);
    expect(error).toContain('role="alert"');
    expect(error).toContain("Coba lagi");
    expect(error).not.toContain("Belum ada invoice");
  });
  it("menampilkan loading dan semua hasil pada daftar yang panjang", () => {
    expect(renderToStaticMarkup(<InvoicesSkeleton />)).toContain(
      'aria-label="Memuat invoice"'
    );
    const large = Array.from({ length: 80 }, (_, index) => ({
      ...invoices[0],
      id: `large-${index}`,
      number: `INV-LARGE-${index}`,
    }));
    const html = renderToStaticMarkup(<ClientInvoicesTable invoices={large} />);
    expect(html).toContain("Menampilkan seluruh 80 invoice non-draft.");
    expect(html).toContain("INV-LARGE-79");
    const summary = renderToStaticMarkup(<InvoicesSummary invoices={large} />);
    expect(summary).toContain(
      formatCurrency(large.reduce((total, invoice) => total + invoice.total, 0))
    );
  });
});
