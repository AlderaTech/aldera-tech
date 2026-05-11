import type { Role } from "@prisma/client";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  FolderClosed,
  FolderKanban,
  Loader2,
  Newspaper,
  Plus,
  ShoppingCart,
} from "lucide-react";

import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { ADMIN_ROUTES } from "@/lib/routes";
import type { AdminOverviewStats } from "../_data/overview";

export function getOverviewStatCards(stats: AdminOverviewStats) {
  return [
    {
      icon: FolderKanban,
      label: "Total Proyek",
      value: stats.total,
      helper: "Seluruh pipeline delivery",
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      icon: Loader2,
      label: "Proyek Aktif",
      value: stats.active,
      helper: "Sedang dikerjakan tim",
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      icon: Clock,
      label: "Invoice Pending",
      value: stats.pending,
      helper: "Perlu follow up pembayaran",
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      icon: ShoppingCart,
      label: "Order Pending",
      value: stats.orderPending,
      helper: "Estimasi dari kalkulator",
      color: "text-violet-700 bg-violet-50 border-violet-200",
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: stats.revenue,
      helper: "Invoice berstatus paid",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      isCurrency: true,
    },
  ];
}

export function getOverviewQuickActions(role: Role | null | undefined) {
  return [
    {
      href: ADMIN_ROUTES.projectNew,
      label: "Proyek Baru",
      icon: Plus,
      permission: PERMISSIONS.PROJECT_CREATE,
    },
    {
      href: ADMIN_ROUTES.proposalNew,
      label: "Proposal Baru",
      icon: FileText,
      permission: PERMISSIONS.PROPOSAL_MANAGE,
    },
    {
      href: ADMIN_ROUTES.invoiceNew,
      label: "Invoice Baru",
      icon: FileText,
      permission: PERMISSIONS.INVOICE_CREATE,
    },
    {
      href: ADMIN_ROUTES.blogNew,
      label: "Post Baru",
      icon: Newspaper,
      permission: PERMISSIONS.BLOG_CREATE,
    },
  ].filter((action) => hasPermission(role, action.permission));
}

export function getOperationalCards(
  role: Role | null | undefined,
  stats: AdminOverviewStats
) {
  return [
    {
      label: "Delivery aktif",
      value: stats.active,
      icon: CheckCircle2,
      href: ADMIN_ROUTES.projects,
      permission: PERMISSIONS.PROJECT_VIEW_ALL,
    },
    {
      label: "Invoice terbuka",
      value: stats.pending,
      icon: FileText,
      href: ADMIN_ROUTES.invoices,
      permission: PERMISSIONS.INVOICE_VIEW,
    },
    {
      label: "File workspace",
      value: "Manager",
      icon: FolderClosed,
      href: ADMIN_ROUTES.files,
      permission: PERMISSIONS.FILE_MANAGE,
    },
  ].filter((item) => hasPermission(role, item.permission));
}
