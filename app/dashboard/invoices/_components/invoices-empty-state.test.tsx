import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { InvoicesEmptyState } from "./invoices-empty-state";

describe("Empty state invoice", () => {
  it("menampilkan maskot yang tersedia sebelum teks dan navigasi proyek asli", () => {
    const html = renderToStaticMarkup(<InvoicesEmptyState />);
    expect(
      existsSync(
        new URL(
          "../../../../public/images/dashboard/ai-relay/aldera-relay-assistant.webp",
          import.meta.url
        )
      )
    ).toBe(true);
    expect(html.indexOf("<img")).toBeLessThan(
      html.indexOf("Belum ada invoice")
    );
    expect(html).toContain("aldera-relay-assistant");
    expect(html).toContain('alt=""');
    expect(html).toContain('focusable="false"');
    expect(html).toContain(`href="${DASHBOARD_ROUTES.projects}"`);
    expect(html).not.toContain("Semua tagihan lunas");
  });

  it("membedakan filter kosong dan menyediakan reset melalui rute yang tersedia", () => {
    const html = renderToStaticMarkup(<InvoicesEmptyState status="PAID" />);
    expect(html).toContain("Tidak ada invoice dengan status ini");
    expect(html).toContain("Tampilkan semua invoice");
    expect(html).toContain(`href="${DASHBOARD_ROUTES.invoices}"`);
    expect(html).not.toContain("Lihat Proyek Saya");
  });

  it("mengembalikan halaman kosong ke halaman pertama sambil menjaga filter", () => {
    const html = renderToStaticMarkup(
      <InvoicesEmptyState status="SENT" hasMoreInvoices />
    );
    expect(html).toContain("Halaman ini belum berisi invoice");
    expect(html).toContain("Ke halaman pertama");
    expect(html).toContain(
      `href="${DASHBOARD_ROUTES.invoicesWithParams({ status: "SENT" })}"`
    );
    expect(html).not.toContain("page=");
  });
});
