"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  Users,
  FileText,
  Newspaper,
  FolderClosed,
  Settings,
  FileSignature,
  ShieldCheck,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const clientNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Proyek Saya", icon: FolderKanban },
  { href: "/dashboard/invoices", label: "Invoice", icon: Receipt },
];

export const adminNavItems: DashboardNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Proyek", icon: FolderKanban },
  { href: "/admin/proposals", label: "Proposal", icon: FileSignature },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/invoices", label: "Invoice", icon: FileText },
  { href: "/admin/files", label: "File", icon: FolderClosed },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export const ownerNavItems: DashboardNavItem[] = [
  ...adminNavItems,
  { href: "/admin/audit", label: "Audit Log", icon: ShieldCheck },
];

export function DashboardSidebar({
  items,
  onNavigate,
}: {
  items: DashboardNavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <aside className="h-full flex flex-col bg-sidebar text-sidebar-foreground border-r">
      <div className="h-16 flex items-center px-6 border-b">
        <Logo size="md" />
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => {
          const active =
            item.href === "/dashboard" || item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group",
                active
                  ? "text-sidebar-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon
                className={cn(
                  "size-4 relative z-10 transition-transform group-hover:scale-110",
                  active ? "text-primary-foreground" : ""
                )}
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="size-4" />
          Pengaturan
        </Link>
      </div>
    </aside>
  );
}
