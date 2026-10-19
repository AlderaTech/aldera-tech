import { DASHBOARD_ROUTES } from "@/lib/routes";

export function getStudioDashboardSection(pathname: string | null) {
  if (pathname === DASHBOARD_ROUTES.home) return "Ringkasan";
  if (pathname === DASHBOARD_ROUTES.projects) return "Proyek Saya";
  if (pathname === DASHBOARD_ROUTES.orders) return "Pesanan & Estimasi";
  if (pathname === DASHBOARD_ROUTES.calculator) return "Kalkulator Proyek";
  if (pathname === DASHBOARD_ROUTES.aiRelay) return "AI Gateway / Relay";
  if (pathname === DASHBOARD_ROUTES.invoices) return "Invoice & Pembayaran";
  if (pathname === DASHBOARD_ROUTES.profile) return "Profil Saya";
  if (pathname === DASHBOARD_ROUTES.settings) return "Pengaturan";
  return null;
}
