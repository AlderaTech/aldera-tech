"use client";

import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADMIN_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type UserRoleTabsProps = {
  activeRole: string;
  activeView: string;
  counts: { all: number; admin: number; developer: number; client: number };
  canManageUsers: boolean;
};

export function UserRoleTabs({
  activeRole,
  activeView,
  counts,
  canManageUsers,
}: UserRoleTabsProps) {
  const tabs = [
    ...(canManageUsers
      ? [
          {
            key: "ALL",
            label: "Semua",
            count: counts.all,
            href: ADMIN_ROUTES.users,
          },
        ]
      : []),
    ...(canManageUsers
      ? [
          {
            key: "ADMIN",
            label: "Admin",
            count: counts.admin,
            href: `${ADMIN_ROUTES.users}?role=ADMIN`,
          },
        ]
      : []),
    {
      key: "DEVELOPER",
      label: "Developer & Tim",
      count: counts.developer,
      href: `${ADMIN_ROUTES.users}?role=DEVELOPER&view=workload`,
    },
    ...(canManageUsers
      ? [
          {
            key: "CLIENT",
            label: "Client",
            count: counts.client,
            href: `${ADMIN_ROUTES.users}?role=CLIENT`,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {tabs.map((tab) => {
          const isActive = activeRole === tab.key;

          return (
            <Button
              key={tab.key}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              asChild
              className={cn(
                "gap-2 text-xs sm:text-sm",
                isActive && "font-semibold shadow-xs"
              )}
            >
              <Link href={tab.href}>
                {tab.label}
                <Badge
                  variant={isActive ? "default" : "outline"}
                  className="px-1.5 py-0 text-xs"
                >
                  {tab.count}
                </Badge>
              </Link>
            </Button>
          );
        })}
      </div>

      {activeRole === "DEVELOPER" && (
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
          <Button
            size="sm"
            variant={activeView === "workload" ? "secondary" : "ghost"}
            asChild
            className="h-7 gap-1.5 px-2.5 text-xs font-medium"
          >
            <Link href={`${ADMIN_ROUTES.users}?role=DEVELOPER&view=workload`}>
              <LayoutGrid className="size-3.5" />
              <span>Beban Kerja</span>
            </Link>
          </Button>
          <Button
            size="sm"
            variant={activeView === "table" ? "secondary" : "ghost"}
            asChild
            className="h-7 gap-1.5 px-2.5 text-xs font-medium"
          >
            <Link href={`${ADMIN_ROUTES.users}?role=DEVELOPER&view=table`}>
              <List className="size-3.5" />
              <span>Daftar Akun</span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
