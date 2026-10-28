import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PROFILE_PREVIEW_PAYMENTS } from "../_data/profile-preview-data";
import { ProfilePaymentPanel } from "./profile-payment-panel";

describe("Informasi Pembayaran — demo", () => {
  it("menampilkan metode fiktif tersamarkan dan tombol Kelola tanpa input kartu", () => {
    const html = renderToStaticMarkup(<ProfilePaymentPanel />);
    expect(html).toContain(PROFILE_PREVIEW_PAYMENTS[0].name);
    expect(html).toContain(PROFILE_PREVIEW_PAYMENTS[0].maskedNumber);
    expect(html).toContain("Belum terhubung");
    expect(html).toContain("fiktif");
    expect(html).toContain(">Kelola<");
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain("<input");
    expect(html).not.toContain("<form");
    expect(html).toContain(">Demo<");
  });
  it("menerima data kosong dan tidak mengklaim pembayaran berhasil", () => {
    const html = renderToStaticMarkup(<ProfilePaymentPanel methods={[]} />);
    expect(html).toContain('data-preview-state="empty"');
    expect(html).toContain("Belum ada metode demo");
    expect(html).not.toContain(">Kelola<");
    expect(html).not.toContain("berhasil");
  });
});
