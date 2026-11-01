import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../../_test-utils/page-mocks";
import { adminTestInvoice } from "../../../_test-utils/records";
import { API_ROUTES, ADMIN_ROUTES } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";
import { InvoiceDetailHeader } from "./invoice-detail-header";
const context = installAdminPageMocks();
const { default: Page } = await import("../page");
describe("Header detail invoice", () => {
  it("mempertahankan nomor, status, nominal dan tautan PDF asli", async () => {
    context
      .query("invoice", "findUnique")
      .mockResolvedValueOnce(adminTestInvoice);
    const page = await Page({
      params: Promise.resolve({ id: adminTestInvoice.id }),
    });
    const header = page.props.children[0];
    expect(header.type).toBe(InvoiceDetailHeader);
    const html = renderToStaticMarkup(header);
    expect(html).toContain(adminTestInvoice.number);
    expect(html).toContain("Terkirim");
    expect(html).toContain(formatCurrency(adminTestInvoice.total));
    expect(html).toContain(
      'href="' + API_ROUTES.invoicePdf(adminTestInvoice.id) + '"'
    );
    expect(html).toContain('href="' + ADMIN_ROUTES.invoices + '"');
    expect(html).toContain("data-admin-page-header");
  });
});
