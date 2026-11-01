import { describe, expect, it } from "bun:test";
import { DASHBOARD_ROUTES, ADMIN_ROUTES } from "@/lib/routes";
import { getStudioDashboardSection } from "./studio-dashboard-routes";

describe("Tema studio dashboard pengguna", () => {
  it("menonaktifkan rute Pengaturan yang telah dihapus dan mengisolasi sub-rute", () => {
    for (const path of [
      null,
      ADMIN_ROUTES.settings,
      "/dashboard/settings",
      `${DASHBOARD_ROUTES.profile}/detail`,
    ]) {
      expect(getStudioDashboardSection(path)).toBeNull();
    }
  });

  it("mempertahankan seluruh pemetaan dashboard yang aktif termasuk detail proyek", () => {
    const sections = [
      [DASHBOARD_ROUTES.home, "Ringkasan"],
      [DASHBOARD_ROUTES.projects, "Proyek Saya"],
      [DASHBOARD_ROUTES.projectDetail("proj-123"), "Proyek Saya"],
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
