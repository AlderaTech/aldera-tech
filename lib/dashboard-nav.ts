import type { Role } from "@prisma/client";

import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { hasPermission, PERMISSIONS, type Permission } from "@/lib/permissions";

export type DashboardNavIcon =
  | "activity"
  | "archive"
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
  | "tags"
  | "users";

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
      label: "Client Area",
      items: [
        {
          href: DASHBOARD_ROUTES.home,
          label: "Overview",
          icon: "layoutDashboard",
        },
        {
          href: DASHBOARD_ROUTES.projects,
          label: "Proyek Saya",
          icon: "folderKanban",
        },
        {
          href: DASHBOARD_ROUTES.invoices,
          label: "Invoice",
          icon: "receipt",
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
    label: "Overview",
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
    label: "Operasional",
    items: [
      {
        href: ADMIN_ROUTES.projects,
        label: "Proyek",
        icon: "folderKanban",
        description: "Pipeline dan delivery",
        permission: PERMISSIONS.PROJECT_VIEW_ALL,
      },
      {
        href: ADMIN_ROUTES.proposals,
        label: "Proposal",
        icon: "fileSignature",
        description: "Penawaran dan scope",
        permission: PERMISSIONS.PROPOSAL_MANAGE,
      },
      {
        href: ADMIN_ROUTES.invoices,
        label: "Invoice",
        icon: "fileText",
        description: "Tagihan dan pembayaran",
        permission: PERMISSIONS.INVOICE_VIEW,
      },
      {
        href: ADMIN_ROUTES.files,
        label: "File Manager",
        icon: "folderClosed",
        description: "Asset dan dokumen",
        permission: PERMISSIONS.FILE_MANAGE,
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
    ],
  },
  {
    label: "Manajemen",
    items: [
      {
        href: ADMIN_ROUTES.users,
        label: "Pengguna",
        icon: "users",
        description: "Client dan staff",
        permission: PERMISSIONS.USER_MANAGE,
      },
      {
        href: ADMIN_ROUTES.settings,
        label: "Settings Website",
        icon: "settings",
        description: "Kontak, harga, sosial",
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
  role: Role | null | undefined
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

export function getAdminNavConfig(role: Role | null | undefined): DashboardNavConfig {
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
