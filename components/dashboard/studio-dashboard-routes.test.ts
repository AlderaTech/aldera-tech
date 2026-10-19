import { describe, expect, it } from "bun:test";
import { DASHBOARD_ROUTES, ADMIN_ROUTES } from "@/lib/routes";
import { getStudioDashboardSection } from "./studio-dashboard-routes";

describe("Tema studio untuk Pengaturan", () => {
  it("mengaktifkan chrome Pengaturan hanya pada rute tepat", () => {
    expect(getStudioDashboardSection(DASHBOARD_ROUTES.settings)).toBe(
      "Pengaturan"
    );
    for (const path of [
      null,
      ADMIN_ROUTES.settings,
      `${DASHBOARD_ROUTES.settings}/detail`,
      `${DASHBOARD_ROUTES.profile}/detail`,
    ]) {
      expect(getStudioDashboardSection(path)).toBeNull();
    }
  });

  it("mempertahankan seluruh pemetaan dashboard yang sudah ada", () => {
    const sections = [
      [DASHBOARD_ROUTES.home, "Ringkasan"],
      [DASHBOARD_ROUTES.projects, "Proyek Saya"],
      [DASHBOARD_ROUTES.orders, "Pesanan & Estimasi"],
      [DASHBOARD_ROUTES.calculator, "Kalkulator Proyek"],
      [DASHBOARD_ROUTES.aiRelay, "AI Gateway / Relay"],
      [DASHBOARD_ROUTES.invoices, "Invoice & Pembayaran"],
      [DASHBOARD_ROUTES.profile, "Profil Saya"],
    ];
    for (const [path, section] of sections) {
      expect(getStudioDashboardSection(path)).toBe(section);
    }
  });
});
