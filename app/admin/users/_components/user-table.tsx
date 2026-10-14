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
import { formatDate, getInitials } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/permissions";
import { UserRowActions } from "./user-row-actions";
import type { UserListItem } from "../_data/get-users-and-workload";

type UserTableProps = {
  users: UserListItem[];
  canManageUsers: boolean;
};

export function UserTable({ users, canManageUsers }: UserTableProps) {
  return (
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
            {canManageUsers && (
              <TableHead className="text-right">Aksi</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={canManageUsers ? 7 : 6}
                className="py-10 text-center text-muted-foreground"
              >
                Tidak ada pengguna dalam kategori ini.
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
                      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                        {getInitials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{u.name}</div>
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
                {canManageUsers && (
                  <TableCell className="text-right">
                    <UserRowActions
                      userId={u.id}
                      roles={u.roles}
                      isActive={u.isActive}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
