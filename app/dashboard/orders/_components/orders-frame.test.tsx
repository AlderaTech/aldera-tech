import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { OrdersFrame } from "./orders-frame";
import { DASHBOARD_ROUTES } from "@/lib/routes";
describe("Banner riwayat estimasi", () => {
  it("menjaga ID, konten dinamis, dan tindakan estimasi asli", () => {
    const html = renderToStaticMarkup(
      <OrdersFrame>
        <p>Isi daftar asli</p>
      </OrdersFrame>
    );
    expect(html).toContain('id="orders-heading"');
    expect(html).toContain('data-workspace-mascot-pose="orders"');
    expect(html).toContain('href="' + DASHBOARD_ROUTES.calculator + '"');
    expect(html).toContain("Isi daftar asli");
    expect(html).toContain("data-workspace-banner-badge");
    expect(html).toContain("lucide-calculator");
  });
});
