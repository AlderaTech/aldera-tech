"use client";

import { useTransition } from "react";
import {
  MoreHorizontal,
  Power,
  Shield,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  toggleUserActiveAction,
  updateUserRoleAction,
} from "@/lib/actions/admin";
import { ROLE_LABELS, STAFF_ROLES } from "@/lib/permissions";

const ASSIGNABLE_ROLES: Role[] = [...STAFF_ROLES, "CLIENT"];

export function UserRowActions({
  userId,
  role,
  isActive,
}: {
  userId: string;
  role: Role;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" disabled={isPending} aria-label="Aksi">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Ubah Role</DropdownMenuLabel>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Shield className="size-4" /> Pilih Role
            <ChevronRight className="ml-auto size-3.5" />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {ASSIGNABLE_ROLES.map((r) => (
              <DropdownMenuItem
                key={r}
                disabled={r === role}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await updateUserRoleAction(userId, r);
                      toast.success(`Role diubah menjadi ${ROLE_LABELS[r]}`);
                    } catch (err) {
                      toast.error((err as Error).message);
                    }
                  })
                }
              >
                {ROLE_LABELS[r]}
                {r === role && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    aktif
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant={isActive ? "destructive" : "default"}
          onClick={() =>
            startTransition(async () => {
              try {
                await toggleUserActiveAction(userId);
                toast.success(isActive ? "Dinonaktifkan" : "Diaktifkan");
              } catch (err) {
                toast.error((err as Error).message);
              }
            })
          }
        >
          <Power className="size-4" />
          {isActive ? "Nonaktifkan" : "Aktifkan"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
