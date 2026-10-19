import { describe, expect, it } from "bun:test";
import { isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Page, { metadata } from "./page";
import { DASHBOARD_ROUTES } from "@/lib/routes";

describe("Halaman Pengaturan", () => {
  it("merender judul tunggal dan metadata khusus Pengaturan", () => {
    expect(isValidElement(Page())).toBe(true);
    const html = renderToStaticMarkup(<Page />);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("Pengaturan</h1>");
    expect(metadata.title).toBe("Pengaturan");
    expect(metadata.description).toContain("Aldera Tech");
    expect(metadata.description).toContain("ketersediaan pengaturan");
  });

  it("menjaga halaman informasional tanpa formulir atau penyimpanan palsu", () => {
    const html = renderToStaticMarkup(<Page />);
    expect(html).toContain("Belum tersedia");
    expect(html).toContain(
      "Pengaturan notifikasi email akan hadir sebentar lagi."
    );
    expect(html).not.toMatch(/<(form|input|select|textarea)\b/);
    expect(html).not.toContain('role="switch"');
    expect(html).not.toContain('type="submit"');
    expect(html).not.toContain("Simpan");
    expect(html).not.toContain("Tersimpan");
  });

  it("menyediakan satu CTA ke Profil melalui rute yang tersedia", () => {
    const html = renderToStaticMarkup(<Page />);
    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(html).toContain(`href="${DASHBOARD_ROUTES.profile}"`);
    expect(html).toContain("Kelola Profil");
  });
});
