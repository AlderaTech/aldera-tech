import { describe, expect, it } from "bun:test";
import { ADMIN_BANNER_CATEGORIES } from "./admin-banner-categories";

describe("Kategori menu Admin", () => {
  it("mengikuti pemetaan label yang ditentukan tanpa fallback ADMIN CONSOLE", () => {
    expect(
      Object.fromEntries(
        Object.entries(ADMIN_BANNER_CATEGORIES).map(([key, value]) => [
          key,
          value.label,
        ])
      )
    ).toEqual({
      overview: "RINGKASAN SISTEM",
      projects: "MANAJEMEN PROYEK",
      estimates: "ESTIMASI & PESANAN",
      billing: "KEUANGAN & TAGIHAN",
      ai: "OPERASIONAL AI GATEWAY",
      analytics: "ANALITIK & LAPORAN",
      content: "MANAJEMEN KONTEN",
      users: "PENGGUNA & TIM",
      settings: "PENGATURAN SISTEM",
      audit: "AUDIT & KEAMANAN",
    });
  });
});
