"use client";
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, Bell, Search } from "lucide-react";
import type { Session } from "next-auth";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import {
  DashboardSidebar,
  type DashboardNavItem,
} from "@/components/dashboard/sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { isStaff } from "@/lib/permissions";

type DashboardHeaderProps = {
  session: Session;
  navItems: DashboardNavItem[];
};

function toTitleCase(s: string) {
  return s
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, idx) => ({
    label: toTitleCase(decodeURIComponent(seg)),
    href: "/" + segments.slice(0, idx + 1).join("/"),
    current: idx === segments.length - 1,
  }));
}

export function DashboardHeader({ session, navItems }: DashboardHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const crumbs = useBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b flex items-center gap-2 px-4 sm:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Buka sidebar"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 sm:w-80">
          <SheetTitle className="sr-only">Navigasi Dashboard</SheetTitle>
          <DashboardSidebar
            items={navItems}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm min-w-0 flex-1">
        {crumbs.length === 0 ? (
          <span className="font-semibold">Dashboard</span>
        ) : (
          crumbs.map((c, i) => (
            <React.Fragment key={c.href}>
              {i > 0 && (
                <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
              )}
              {c.current ? (
                <span className="font-semibold text-foreground truncate">
                  {c.label}
                </span>
              ) : (
                <Link
                  href={c.href}
                  className="text-muted-foreground hover:text-foreground transition-colors truncate"
                >
                  {c.label}
                </Link>
              )}
            </React.Fragment>
          ))
        )}
      </nav>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            // Dispatch Cmd+K keydown to open palette
            const ev = new KeyboardEvent("keydown", {
              key: "k",
              metaKey: true,
              ctrlKey: true,
              bubbles: true,
            });
            window.dispatchEvent(ev);
          }}
          className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm text-muted-foreground hover:bg-accent transition-colors"
          aria-label="Buka pencarian"
        >
          <Search className="size-3.5" />
          <span>Cari…</span>
          <span className="ml-2 text-xs border rounded px-1.5 py-0.5 text-muted-foreground/70">
            ⌘K
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifikasi"
          className="hidden sm:inline-flex"
        >
          <Bell className="size-4" />
        </Button>
        <ThemeToggle />
        <UserMenu session={session} />
      </div>
      <CommandPalette isStaff={isStaff(session.user.role)} />
    </header>
  );
}
