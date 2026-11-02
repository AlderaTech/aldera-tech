import {
  BarChart3,
  Bot,
  Calculator,
  FolderKanban,
  LayoutDashboard,
  Newspaper,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export const ADMIN_BANNER_CATEGORIES = {
  overview: { label: "RINGKASAN SISTEM", icon: LayoutDashboard },
  projects: { label: "MANAJEMEN PROYEK", icon: FolderKanban },
  estimates: { label: "ESTIMASI & PESANAN", icon: Calculator },
  billing: { label: "KEUANGAN & TAGIHAN", icon: ReceiptText },
  ai: { label: "OPERASIONAL AI GATEWAY", icon: Bot },
  analytics: { label: "ANALITIK & LAPORAN", icon: BarChart3 },
  content: { label: "MANAJEMEN KONTEN", icon: Newspaper },
  users: { label: "PENGGUNA & TIM", icon: Users },
  settings: { label: "PENGATURAN SISTEM", icon: Settings },
  audit: { label: "AUDIT & KEAMANAN", icon: ShieldCheck },
} as const;

export type AdminBannerCategory = keyof typeof ADMIN_BANNER_CATEGORIES;
