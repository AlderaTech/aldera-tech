"use client";

import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADMIN_ROUTES } from "@/lib/routes";
import styles from "./user-role-tabs.module.css";

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
    <div className={styles.bar} data-admin-user-filters>
      <nav className={styles.roles} aria-label="Filter peran pengguna">
        <div className={styles.roleList} data-role-count={tabs.length}>
          {tabs.map((tab) => {
            const isActive = activeRole === tab.key;

            return (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                asChild
                className={styles.option}
              >
                <Link
                  href={tab.href}
                  data-admin-user-option
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={styles.label}>{tab.label}</span>
                  <Badge
                    variant={isActive ? "default" : "outline"}
                    className={styles.count}
                  >
                    {tab.count}
                  </Badge>
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>

      {activeRole === "DEVELOPER" && (
        <nav className={styles.views} aria-label="Tampilan anggota tim">
          <Button size="sm" variant="ghost" asChild className={styles.option}>
            <Link
              href={`${ADMIN_ROUTES.users}?role=DEVELOPER&view=workload`}
              data-admin-user-option
              aria-current={activeView === "workload" ? "page" : undefined}
            >
              <LayoutGrid className="size-4" aria-hidden="true" />
              <span>Beban Kerja</span>
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild className={styles.option}>
            <Link
              href={`${ADMIN_ROUTES.users}?role=DEVELOPER&view=table`}
              data-admin-user-option
              aria-current={activeView === "table" ? "page" : undefined}
            >
              <List className="size-4" aria-hidden="true" />
              <span>Daftar Akun</span>
            </Link>
          </Button>
        </nav>
      )}
    </div>
  );
}
