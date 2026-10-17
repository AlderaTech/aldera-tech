import type { Role } from "@prisma/client";

import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { hasPermission, PERMISSIONS, type Permission } from "@/lib/permissions";

export type DashboardNavIcon =
  | "activity"
  | "archive"
  | "barChart3"
  | "bot"
  | "briefcase"
  | "clock"
  | "fileSignature"
  | "fileText"
  | "folderClosed"
  | "folderKanban"
  | "layoutDashboard"
  | "newspaper"
  | "plus"
  | "receipt"
  | "repeat"
  | "settings"
  | "shieldCheck"
  | "star"
  | "tags"
  | "trendingUp"
  | "users"
  | "users2";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: DashboardNavIcon;
  description?: string;
  permission?: Permission;
  items?: DashboardNavItem[];
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

export type DashboardNavConfig = {
  groups: DashboardNavGroup[];
  footerItem?: DashboardNavItem;
  variant: "admin" | "client";
};

export const clientNavConfig: DashboardNavConfig = {
  variant: "client",
  groups: [
    {
      label: "Ringkasan",
      items: [
        {
          href: DASHBOARD_ROUTES.home,
          label: "Ringkasan",
          icon: "layoutDashboard",
          description: "Ikhtisar akun & aktivitas",
        },
      ],
    },
    {
      label: "Project Conventional",
      items: [
        {
          href: DASHBOARD_ROUTES.projects,
          label: "Proyek Saya",
          icon: "folderKanban",
          description: "Pemesanan web, mobile & delivery",
        },
        {
          href: DASHBOARD_ROUTES.orders,
          label: "Pesanan & Estimasi",
          icon: "receipt",
          description: "Riwayat pesanan kalkulator",
        },
        {
          href: DASHBOARD_ROUTES.calculator,
          label: "Kalkulator Proyek",
          icon: "barChart3",
          description: "Hitung estimasi proyek baru",
        },
        {
          href: DASHBOARD_ROUTES.invoices,
          label: "Invoice & Pembayaran",
          icon: "fileText",
          description: "Tagihan termin dan pembayaran",
        },
      ],
    },
    {
      label: "Router (AI Gateway)",
      items: [
        {
          href: DASHBOARD_ROUTES.aiRelay,
          label: "AI Gateway / Relay",
          icon: "bot",
          description: "API Keys, saldo top-up & playground",
        },
      ],
    },
  ],
  footerItem: {
    href: DASHBOARD_ROUTES.settings,
    label: "Pengaturan",
    icon: "settings",
  },
};

const adminNavGroups: DashboardNavGroup[] = [
  {
    label: "Ringkasan",
    items: [
      {
        href: ADMIN_ROUTES.home,
        label: "Dashboard",
        icon: "layoutDashboard",
        description: "Ringkasan performa",
      },
    ],
  },
  {
    label: "Project Conventional",
    items: [
      {
        href: ADMIN_ROUTES.projects,
        label: "Proyek",
        icon: "folderKanban",
        description: "Pipeline dan delivery web & mobile",
        permission: PERMISSIONS.PROJECT_VIEW_ALL,
      },
      {
        href: ADMIN_ROUTES.orders,
        label: "Permohonan Pesanan",
        icon: "receipt",
        description: "Estimasi dari kalkulator",
        permission: PERMISSIONS.PROJECT_VIEW_ALL,
      },
      {
        href: ADMIN_ROUTES.calculator,
        label: "Kalkulator Harga",
        icon: "barChart3",
        description: "Kelola jenis proyek & fitur",
        permission: PERMISSIONS.SETTINGS_MANAGE,
      },
      {
        href: ADMIN_ROUTES.proposals,
        label: "Proposal",
        icon: "fileSignature",
        description: "Penawaran dan scope kerja",
        permission: PERMISSIONS.PROPOSAL_MANAGE,
      },
      {
        href: ADMIN_ROUTES.invoices,
        label: "Invoice",
        icon: "fileText",
        description: "Tagihan dan pembayaran termin",
        permission: PERMISSIONS.INVOICE_VIEW,
      },
      {
        href: ADMIN_ROUTES.timesheet,
        label: "Timesheet",
        icon: "clock",
        description: "Laporan jam kerja developer",
        permission: PERMISSIONS.TIMESHEET_VIEW,
      },
      {
        href: ADMIN_ROUTES.files,
        label: "Manajer Berkas",
        icon: "folderClosed",
        description: "Asset dan dokumen proyek",
        permission: PERMISSIONS.FILE_MANAGE,
      },
    ],
  },
  {
    label: "Router (AI Gateway)",
    items: [
      {
        href: ADMIN_ROUTES.aiRelay,
        label: "AI Gateway / Relay Ops",
        icon: "bot",
        description: "Pricing model, router sync & audit",
        permission: PERMISSIONS.AI_RELAY_MANAGE,
      },
    ],
  },
  {
    label: "Analitik",
    items: [
      {
        href: ADMIN_ROUTES.analytics,
        label: "Pendapatan & Profitabilitas",
        icon: "trendingUp",
        description: "Performa bisnis",
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
    ],
  },
  {
    label: "Konten",
    items: [
      {
        href: ADMIN_ROUTES.blog,
        label: "Blog",
        icon: "newspaper",
        description: "Artikel dan publikasi",
        permission: PERMISSIONS.BLOG_VIEW,
      },
      {
        href: ADMIN_ROUTES.blogCategories,
        label: "Kategori Blog",
        icon: "tags",
        description: "Taxonomy artikel",
        permission: PERMISSIONS.BLOG_VIEW,
      },
      {
        href: ADMIN_ROUTES.portfolio,
        label: "Portfolio",
        icon: "briefcase",
        description: "Studi kasus dan proyek publik",
        permission: PERMISSIONS.PORTFOLIO_VIEW,
      },
      {
        href: ADMIN_ROUTES.testimonials,
        label: "Testimoni",
        icon: "star",
        description: "Ulasan dan rating klien",
        permission: PERMISSIONS.TESTIMONIAL_VIEW,
      },
    ],
  },
  {
    label: "Manajemen",
    items: [
      {
        href: ADMIN_ROUTES.users,
        label: "Pengguna & Tim",
        icon: "users",
        description: "Client, admin & beban kerja tim",
        permission: PERMISSIONS.TEAM_VIEW,
      },
      {
        href: ADMIN_ROUTES.settings,
        label: "Pengaturan Situs",
        icon: "settings",
        description: "Kontak, identitas, sosial",
        permission: PERMISSIONS.SETTINGS_MANAGE,
      },
    ],
  },
  {
    label: "Sistem",
    items: [
      {
        href: ADMIN_ROUTES.audit,
        label: "Audit Log",
        icon: "shieldCheck",
        description: "Riwayat perubahan",
        permission: PERMISSIONS.AUDIT_VIEW,
      },
    ],
  },
];

function filterItemByRole(
  item: DashboardNavItem,
  role: Role | Role[] | null | undefined
): DashboardNavItem | null {
  if (item.permission && !hasPermission(role, item.permission)) {
    return null;
  }

  const children = item.items
    ?.map((child) => filterItemByRole(child, role))
    .filter((child): child is DashboardNavItem => Boolean(child));

  return {
    ...item,
    ...(children ? { items: children } : {}),
  };
}

export function getAdminNavConfig(
  role: Role | Role[] | null | undefined
): DashboardNavConfig {
  const groups = adminNavGroups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => filterItemByRole(item, role))
        .filter((item): item is DashboardNavItem => Boolean(item)),
    }))
    .filter((group) => group.items.length > 0);

  return {
    variant: "admin",
    groups,
  };
}
