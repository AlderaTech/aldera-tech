"use client";

import Link from "next/link";
import * as React from "react";
import { signOut } from "next-auth/react";
import {
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  Shield,
} from "lucide-react";
import type { Session } from "next-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { isStaff } from "@/lib/permissions";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function UserMenu({ session }: { session: Session }) {
  const user = session.user;
  const isAdmin = isStaff(user.role);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Menu pengguna"
            className="rounded-full"
          >
            <Avatar className="size-8">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name ?? "User"} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(user.name ?? "U")}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-0.5">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isAdmin ? (
            <DropdownMenuItem asChild>
              <Link href={ADMIN_ROUTES.home}>
                <Shield className="size-4" /> Admin Panel
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link href={DASHBOARD_ROUTES.home}>
                <LayoutDashboard className="size-4" /> Dashboard
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href={DASHBOARD_ROUTES.profile}>
              <UserIcon className="size-4" /> Profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              setLogoutOpen(true);
            }}
          >
            <LogOut className="size-4" /> Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Keluar dari akun?"
        description="Sesi Anda akan diakhiri dan Anda perlu login kembali untuk mengakses dashboard."
        confirmLabel="Keluar"
        destructive
        onConfirm={() => signOut({ redirectTo: "/" })}
      />
    </>
  );
}
