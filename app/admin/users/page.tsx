import { UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatDate, getInitials } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/permissions";
import { UserRowActions } from "./_components/user-row-actions";
import { InviteUserDialog } from "./_components/invite-user-dialog";

export default async function AdminUsersPage() {
  const users = await safeDb(
    async () =>
      await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { projects: true, invoices: true } },
        },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengguna</h1>
          <p className="text-muted-foreground">
            Kelola admin dan client yang memiliki akses platform.
          </p>
        </div>
        <InviteUserDialog>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90">
            <UserPlus className="size-4" /> Invite User
          </button>
        </InviteUserDialog>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden lg:table-cell">Proyek</TableHead>
              <TableHead className="hidden xl:table-cell">Bergabung</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-muted-foreground"
                >
                  Belum ada user.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        {u.avatar ? (
                          <AvatarImage src={u.avatar} alt={u.name} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {getInitials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{u.name}</div>
                        {u.company && (
                          <div className="truncate text-xs text-muted-foreground">
                            {u.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <Badge
                          key={r}
                          variant={
                            r === "ADMIN"
                              ? "default"
                              : r === "DEVELOPER"
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {ROLE_LABELS[r] ?? r}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {u._count.projects}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "success" : "outline"}>
                      {u.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <UserRowActions
                      userId={u.id}
                      roles={u.roles}
                      isActive={u.isActive}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
