"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Archive,
  BarChart3,
  Bot,
  Briefcase,
  Clock,
  FileSignature,
  FileText,
  FolderClosed,
  FolderKanban,
  LayoutDashboard,
  Newspaper,
  Plus,
  Receipt,
  Repeat,
  Settings,
  ShieldCheck,
  Star,
  Tags,
  TrendingUp,
  Users,
  Users2,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import {
  type DashboardNavGroup,
  type DashboardNavIcon,
  type DashboardNavItem,
} from "@/lib/dashboard-nav";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const navIcons: Record<DashboardNavIcon, LucideIcon> = {
  activity: Activity,
  archive: Archive,
  barChart3: BarChart3,
  bot: Bot,
  briefcase: Briefcase,
  clock: Clock,
  fileSignature: FileSignature,
  fileText: FileText,
  folderClosed: FolderClosed,
  folderKanban: FolderKanban,
  layoutDashboard: LayoutDashboard,
  newspaper: Newspaper,
  plus: Plus,
  receipt: Receipt,
  repeat: Repeat,
  settings: Settings,
  shieldCheck: ShieldCheck,
  star: Star,
  tags: Tags,
  trendingUp: TrendingUp,
  users: Users,
  users2: Users2,
};

export function isNavItemActive(
  pathname: string,
  href: string,
  allHrefs: string[] = []
): boolean {
  if (href === ADMIN_ROUTES.home || href === DASHBOARD_ROUTES.home) {
    return pathname === href;
  }

  const matches = pathname === href || pathname.startsWith(`${href}/`);
  if (!matches) {
    return false;
  }

  if (pathname === href) {
    return true;
  }

  // If matched via prefix, make sure there is no more specific (longer) match among registered routes
  const hasMoreSpecificMatch = allHrefs.some(
    (other) =>
      other !== href &&
      other.length > href.length &&
      (pathname === other || pathname.startsWith(`${other}/`))
  );

  return !hasMoreSpecificMatch;
}

function hasActiveChild(
  pathname: string,
  item: DashboardNavItem,
  allHrefs: string[]
) {
  return (
    item.items?.some((child) =>
      isNavItemActive(pathname, child.href, allHrefs)
    ) ?? false
  );
}

function NavLink({
  item,
  active,
  child,
  onNavigate,
}: {
  item: DashboardNavItem;
  active: boolean;
  child?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = navIcons[item.icon];

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex min-h-10 items-center gap-3 rounded-lg text-sm font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:outline-none",
        child ? "px-3 py-2 pl-10 text-[13px]" : "px-3 py-2.5",
        active
          ? "bg-slate-950 text-white shadow-sm shadow-slate-950/10"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      )}
    >
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-md transition-colors",
          child && "size-5 rounded-sm",
          active
            ? "bg-white/10 text-white"
            : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-primary"
        )}
      >
        <Icon className={child ? "size-3.5" : "size-4"} />
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  );
}

export function DashboardSidebar({
  groups,
  footerItem,
  variant = "client",
  onNavigate,
}: {
  groups: DashboardNavGroup[];
  footerItem?: DashboardNavItem;
  variant?: "admin" | "client";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const allHrefs = useMemo(() => {
    const hrefs: string[] = [];
    for (const group of groups) {
      for (const item of group.items) {
        hrefs.push(item.href);
        if (item.items) {
          for (const child of item.items) {
            hrefs.push(child.href);
          }
        }
      }
    }
    if (footerItem) {
      hrefs.push(footerItem.href);
    }
    return hrefs;
  }, [groups, footerItem]);

  const footerActive = footerItem
    ? isNavItemActive(pathname, footerItem.href, allHrefs)
    : false;

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200/80 bg-white text-slate-900">
      <div className="flex h-16 items-center border-b border-slate-200/80 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Logo size="md" />
          {variant === "admin" && (
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
              Admin
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <div className="px-3 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    isNavItemActive(pathname, item.href, allHrefs) ||
                    hasActiveChild(pathname, item, allHrefs);
                  const childItems = item.items ?? [];

                  return (
                    <div key={item.href} className="space-y-1">
                      <NavLink
                        item={item}
                        active={active}
                        onNavigate={onNavigate}
                      />
                      {childItems.length > 0 && active && (
                        <div className="relative ml-3 space-y-1 border-l border-slate-200 pl-1.5">
                          {childItems.map((child) => (
                            <NavLink
                              key={child.href}
                              item={child}
                              active={isNavItemActive(
                                pathname,
                                child.href,
                                allHrefs
                              )}
                              child
                              onNavigate={onNavigate}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {footerItem && (
        <div className="border-t border-slate-200/80 p-3">
          <NavLink
            item={footerItem}
            active={footerActive}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </aside>
  );
}
