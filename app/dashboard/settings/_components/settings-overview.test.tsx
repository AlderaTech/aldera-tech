import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SettingsOverview } from "./settings-overview";

describe("SettingsOverview", () => {
  it("memisahkan ketersediaan notifikasi dan pengelolaan informasi akun", () => {
    const html = renderToStaticMarkup(<SettingsOverview />);
    expect(html).toContain('aria-labelledby="notifications-title"');
    expect(html).toContain('id="notifications-title">Notifikasi</h2>');
    expect(html).toContain('aria-labelledby="account-title"');
    expect(html).toContain('id="account-title"');
    expect(html).toContain("nama lengkap dan nomor telepon");
    expect(html).toContain(
      "Belum ada preferensi notifikasi yang dapat diubah di halaman ini."
    );
  });

  it("menjadikan mini maskot dekoratif tanpa kontrol tambahan", () => {
    const html = renderToStaticMarkup(<SettingsOverview />);
    expect(html.match(/<img\b/g)).toHaveLength(1);
    expect(html).toContain('alt=""');
    expect(html).toContain('sizes="112px"');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain("tabindex=");
    expect(html).not.toMatch(/<button\b/);
  });
});
