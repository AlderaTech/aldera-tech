import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { formatDate } from "@/lib/utils";
import { hasPermission, PERMISSIONS, ROLE_LABELS } from "@/lib/permissions";
import { ADMIN_ROUTES, AUTH_ROUTES } from "@/lib/routes";

export default async function AuditLogPage() {
  const session = await auth();
  if (!session?.user) redirect(AUTH_ROUTES.login);
  if (!hasPermission(session.user.role, PERMISSIONS.AUDIT_VIEW)) {
    redirect(ADMIN_ROUTES.home);
  }

  const logs = await safeDb(
    async () =>
      await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { user: { select: { name: true, email: true, roles: true } } },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">
          200 audit entries terakhir. Untuk transparansi perubahan di sistem.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Pengguna</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead className="hidden md:table-cell">Entitas</TableHead>
              <TableHead className="hidden lg:table-cell">IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  Belum ada audit log.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {formatDate(log.createdAt, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{log.user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {log.user.roles
                        .map((r) => ROLE_LABELS[r] ?? r)
                        .join(", ")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {log.entityType}
                    {log.entityId ? `:${log.entityId.slice(0, 8)}` : ""}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                    {log.ip ?? "-"}
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
