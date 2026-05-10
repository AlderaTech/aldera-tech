"use client";

import { useState, useTransition } from "react";
import {
  MoreHorizontal,
  Power,
  Shield,
} from "lucide-react";
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
  const [roleTarget, setRoleTarget] = useState<Role | null>(null);
  const [activeOpen, setActiveOpen] = useState(false);

  function handleRoleChange(nextRole: Role) {
    startTransition(async () => {
      try {
        await updateUserRoleAction(userId, nextRole);
        toast.success(`Role diubah menjadi ${ROLE_LABELS[nextRole]}`);
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
          <DropdownMenuLabel>Ubah Role</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Shield className="size-4" /> Pilih Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {ASSIGNABLE_ROLES.map((r) => (
                <DropdownMenuItem
                  key={r}
                  disabled={r === role}
                  onSelect={(event) => {
                    event.preventDefault();
                    setRoleTarget(r);
                  }}
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
        description={`Role pengguna akan diubah menjadi ${roleTarget ? ROLE_LABELS[roleTarget] : ""}. Perubahan ini memengaruhi akses dashboard.`}
        confirmLabel="Ubah role"
        pending={isPending}
        onConfirm={() => {
          if (roleTarget) handleRoleChange(roleTarget);
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
