"use client";

import { useState, useTransition } from "react";
import { Check, MoreHorizontal, Power, Shield } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
  toggleUserRoleAction,
} from "@/lib/actions/admin";
import { ROLE_LABELS, STAFF_ROLES } from "@/lib/permissions";

const ASSIGNABLE_ROLES: Role[] = [...STAFF_ROLES, "CLIENT"];

export function UserRowActions({
  userId,
  roles,
  isActive,
}: {
  userId: string;
  roles: Role[];
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [roleTarget, setRoleTarget] = useState<Role | null>(null);
  const [activeOpen, setActiveOpen] = useState(false);

  function handleToggleRole(role: Role) {
    startTransition(async () => {
      try {
        await toggleUserRoleAction(userId, role);
        const willHave = !roles.includes(role);
        toast.success(
          willHave
            ? `Role ${ROLE_LABELS[role]} ditambahkan.`
            : `Role ${ROLE_LABELS[role]} dihapus.`
        );
        setRoleTarget(null);
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleToggleActive() {
    startTransition(async () => {
      try {
        await toggleUserActiveAction(userId);
        toast.success(isActive ? "Dinonaktifkan" : "Diaktifkan");
        setActiveOpen(false);
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            disabled={isPending}
            aria-label="Aksi"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Kelola Role</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Shield className="size-4" /> Toggle Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {ASSIGNABLE_ROLES.map((r) => {
                const hasRole = roles.includes(r);
                return (
                  <DropdownMenuItem
                    key={r}
                    onSelect={(event) => {
                      event.preventDefault();
                      setRoleTarget(r);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {hasRole && <Check className="size-3.5 text-primary" />}
                      <span className={hasRole ? "font-medium" : ""}>
                        {ROLE_LABELS[r]}
                      </span>
                    </span>
                    {hasRole && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        aktif
                      </span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant={isActive ? "destructive" : "default"}
            onSelect={(event) => {
              event.preventDefault();
              setActiveOpen(true);
            }}
          >
            <Power className="size-4" />
            {isActive ? "Nonaktifkan" : "Aktifkan"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={Boolean(roleTarget)}
        onOpenChange={(open) => {
          if (!open) setRoleTarget(null);
        }}
        title="Ubah role pengguna?"
        description={
          roleTarget
            ? roles.includes(roleTarget)
              ? `Hapus role "${ROLE_LABELS[roleTarget]}" dari pengguna ini?`
              : `Tambahkan role "${ROLE_LABELS[roleTarget]}" ke pengguna ini?`
            : ""
        }
        confirmLabel="Konfirmasi"
        pending={isPending}
        onConfirm={() => {
          if (roleTarget) handleToggleRole(roleTarget);
        }}
      />
      <ConfirmDialog
        open={activeOpen}
        onOpenChange={setActiveOpen}
        title={isActive ? "Nonaktifkan pengguna?" : "Aktifkan pengguna?"}
        description={
          isActive
            ? "Pengguna tidak akan bisa memakai akses platform sampai diaktifkan kembali."
            : "Pengguna akan kembali memiliki akses sesuai role yang dimiliki."
        }
        confirmLabel={isActive ? "Nonaktifkan" : "Aktifkan"}
        destructive={isActive}
        pending={isPending}
        onConfirm={handleToggleActive}
      />
    </>
  );
}
