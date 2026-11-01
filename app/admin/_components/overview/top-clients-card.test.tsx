import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ADMIN_ROUTES } from "@/lib/routes";
import { TopClientsCard } from "./top-clients-card";
import { formatCurrency } from "@/lib/utils";
describe("Top 5 Client", () => {
  it("menampilkan kosong secara jujur tanpa peringkat palsu", () => {
    const html = renderToStaticMarkup(<TopClientsCard clients={[]} />);
    expect(html).toContain("Belum ada data client");
    expect(html).not.toContain("Rp");
  });
  it("mempertahankan urutan, nama, dan nominal sumber", () => {
    const clients = [
      { name: "Klien dengan nama panjang untuk pengujian", revenue: 987654321 },
      { name: "Klien kedua", revenue: 123456789 },
    ];
    const html = renderToStaticMarkup(<TopClientsCard clients={clients} />);
    expect(html.indexOf(clients[0].name)).toBeLessThan(
      html.indexOf(clients[1].name)
    );
    for (const client of clients) {
      expect(html).toContain(client.name);
      expect(html).toContain(formatCurrency(client.revenue));
    }
  });
  it("mengisi sisa slot peringkat Top 5 dan ringkasan footer saat jumlah client kurang dari 5 agar tidak menyisakan ruang kosong", () => {
    const clients = [{ name: "Gading", revenue: 13875000 }];
    const html = renderToStaticMarkup(<TopClientsCard clients={clients} />);
    expect(html).toContain("Gading");
    expect(html).toContain(formatCurrency(13875000));
    expect(html.match(/data-client-slot-placeholder/g)).toHaveLength(4);
    expect(html).toContain("Total Revenue Top Client (1/5 slot)");
    expect(html).toContain(`href="${ADMIN_ROUTES.invoices}"`);
    expect(html).toContain(`href="${ADMIN_ROUTES.analytics}"`);
  });
});
