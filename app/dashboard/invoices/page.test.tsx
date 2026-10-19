import { beforeEach, describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { getStudioDashboardSection } from "@/components/dashboard/studio-dashboard-routes";

const findMany = mock(async (): Promise<unknown[]> => []);
const count = mock(async (): Promise<number> => 0);

mock.module("@/auth", () => ({
  auth: async () => ({ user: { id: "test-client" } }),
}));
mock.module("@/lib/prisma", () => ({
  prisma: { invoice: { findMany, count } },
}));
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
const { default: Page, metadata } = await import("./page");
const { InvoicesContent } = await import("./_components/invoices-content");
const { default: Loading } = await import("./loading");

describe("Halaman Invoice & Pembayaran", () => {
  beforeEach(() => {
    findMany.mockReset();
    count.mockReset();
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
  });
  it("memiliki judul, metadata, loading, dan tema khusus rute daftar", async () => {
    expect(await Page()).toBeDefined();
    expect(metadata.title).toBe("Invoice & Pembayaran");
    expect(metadata.description).toContain("invoice");
    const loading = renderToStaticMarkup(<Loading />);
    expect(loading).toContain("Invoice &amp; Pembayaran");
    expect(loading).toContain('aria-label="Memuat invoice"');
    expect(getStudioDashboardSection(DASHBOARD_ROUTES.invoices)).toBe(
      "Invoice & Pembayaran"
    );
    expect(
      getStudioDashboardSection(`${DASHBOARD_ROUTES.invoices}/separate-detail`)
    ).toBeNull();
  });
  it("mempertahankan akses, filter non-draft, urutan, paginasi, dan relasi proyek", async () => {
    await InvoicesContent();
    expect(findMany).toHaveBeenCalledWith({
      where: { clientId: "test-client", status: { not: "DRAFT" } },
      orderBy: { issueDate: "desc" },
      skip: 0,
      take: 10,
      include: { project: { select: { title: true } } },
    });
  });
  it("mendukung filter status spesifik dan navigasi paginasi", async () => {
    await InvoicesContent({
      searchParams: { status: "PAID", page: "2" },
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { clientId: "test-client", status: "PAID" },
      orderBy: { issueDate: "desc" },
      skip: 10,
      take: 10,
      include: { project: { select: { title: true } } },
    });
    expect(count).toHaveBeenCalledWith({
      where: { clientId: "test-client", status: "PAID" },
    });
  });
  it("membedakan query kosong dari error tanpa menampilkan ringkasan nol palsu", async () => {
    expect(renderToStaticMarkup(await InvoicesContent())).toContain(
      "Belum ada invoice"
    );
    findMany.mockRejectedValueOnce(new Error("mock database unavailable"));
    const html = renderToStaticMarkup(await InvoicesContent());
    expect(html).toContain("Invoice belum dapat dimuat");
    expect(html).not.toContain("Belum ada invoice");
    expect(html).not.toContain("Rp");
  });
  it("mempertahankan konversi nominal asli dan status walaupun tanggal sudah lewat", async () => {
    const mockInvoice = {
      id: "invoice-test",
      number: "INV-TEST",
      status: "SENT",
      total: { toString: () => "1234567.89" },
      issueDate: new Date("2025-01-01"),
      dueDate: new Date("2025-01-15"),
      project: null,
      paymentProofUrl: null,
    };
    findMany.mockImplementation(async () => [mockInvoice]);
    count.mockResolvedValueOnce(1);
    const html = renderToStaticMarkup(await InvoicesContent());
    expect(html).toContain("1.234.568");
    expect(html).toContain('data-status="SENT"');
    expect(html).not.toContain('data-status="OVERDUE"');
  });
});
