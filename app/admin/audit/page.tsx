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
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { DataPagination } from "@/components/shared/data-pagination";
import { ParamFilterSelect } from "@/components/shared/param-filter-select";
import type { Prisma } from "@prisma/client";

const auditActionOptions = [
  { label: "Semua Aksi", value: "ALL" },
  { label: "Create", value: "CREATE" },
  { label: "Update", value: "UPDATE" },
  { label: "Delete", value: "DELETE" },
  { label: "Login", value: "LOGIN" },
  { label: "Status", value: "STATUS" },
];

export interface AdminAuditPageProps {
  searchParams: Promise<{
    q?: string;
    action?: string;
    page?: string;
  }>;
}

export default async function AuditLogPage({
  searchParams,
}: AdminAuditPageProps) {
  const session = await auth();
  if (!session?.user) redirect(AUTH_ROUTES.login);
  if (!hasPermission(session.user.role, PERMISSIONS.AUDIT_VIEW)) {
    redirect(ADMIN_ROUTES.home);
  }

  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);
  const PAGE_SIZE = 20;
  const q = sp?.q?.trim();
  const rawAction = sp?.action?.trim();

  const where: Prisma.AuditLogWhereInput = {};
  if (rawAction && rawAction !== "ALL") {
    where.action = { contains: rawAction, mode: "insensitive" };
  }

  if (q) {
    where.OR = [
      { action: { contains: q, mode: "insensitive" } },
      { entityType: { contains: q, mode: "insensitive" } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [logs, totalCount] = await safeDb(
    async () =>
      await Promise.all([
        prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          include: {
            user: { select: { name: true, email: true, roles: true } },
          },
        }),
        prisma.auditLog.count({ where }),
      ]),
    [[], 0]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">
          Log pencatatan aktivitas untuk transparansi perubahan di sistem.
        </p>
      </div>

      <SearchFilterBar
        placeholder="Cari user, email, aksi, atau entitas..."
        searchParamKey="q"
      >
        <ParamFilterSelect
          paramKey="action"
          options={auditActionOptions}
          placeholder="Filter aksi..."
        />
      </SearchFilterBar>

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
                  Belum ada audit log atau tidak ada log yang sesuai kriteria
                  filter.
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

        <DataPagination
          currentPage={page}
          totalItems={totalCount}
          pageSize={PAGE_SIZE}
        />
      </Card>
    </div>
  );
}
