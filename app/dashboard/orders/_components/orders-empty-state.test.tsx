import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import mascot from "@/public/images/services/aldera-cat-services.webp";
import { EmptyStatePattern } from "../../_components/empty-state-pattern";
import { OrdersEmptyState } from "./orders-empty-state";
import { OrdersFrame } from "./orders-frame";

describe("Empty state Pesanan & Estimasi", () => {
  it("menempatkan maskot sebelum label, judul, dan deskripsi asli", () => {
    const html = renderToStaticMarkup(<OrdersEmptyState />);
    const positions = [
      "<img",
      "Rencanakan langkah Anda",
      "Belum ada estimasi",
      "Gunakan kalkulator harga untuk menghitung estimasi proyek Anda.",
    ].map((text) => html.indexOf(text));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).toContain('aria-labelledby="orders-empty-heading"');
    expect(html).toContain('<h2 id="orders-empty-heading">');
  });

  it("mempertahankan aset dan ukuran responsif dengan corak bersama", () => {
    const state = OrdersEmptyState();
    const image = state.props.children[0];
    expect(image.props.src).toBe(mascot);
    expect(image.props.alt).toBe("");
    expect(image.props["aria-hidden"]).toBe("true");
    expect(image.props.width).toBe(140);
    expect(image.props.height).toBe(140);
    expect(image.props.sizes).toBe("(min-width: 640px) 140px, 112px");
    expect(state.props.children[2].type).toBe(EmptyStatePattern);
  });

  it("tetap menyediakan satu tindakan Estimasi Baru di header dengan route asli", () => {
    const html = renderToStaticMarkup(
      <OrdersFrame>
        <OrdersEmptyState />
      </OrdersFrame>
    );
    expect(html.match(/Estimasi Baru/g)).toHaveLength(1);
    expect(html).toContain(`href="${DASHBOARD_ROUTES.calculator}"`);
    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(html).toContain("Riwayat Estimasi");
  });
});
