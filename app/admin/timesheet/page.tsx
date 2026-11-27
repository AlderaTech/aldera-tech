import { AdminEmptyState } from "@/app/admin/_components/admin-empty-state";
import { AdminBanner } from "@/app/admin/_components/admin-banner";
import { parsePage } from "@/lib/pagination";
import { DataPagination } from "@/components/shared/data-pagination";
import {
  getTimesheetSummary,
  TIMESHEET_PAGE_SIZE,
} from "./_data/timesheet-summary";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Users, Briefcase, DollarSign } from "lucide-react";
import { TimesheetFilters } from "./_components/timesheet-filters";

import { AdminMascot } from "../_components/admin-mascot";
import { AdminStatCard } from "../_components/admin-stat-card";
import {
  exportRangeSchema,
  resolveExportRange,
} from "@/lib/validations/export-range";
import { QueryInputError } from "@/components/shared/query-input-error";
import { ADMIN_ROUTES } from "@/lib/routes";

export default async function TimesheetPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    userPage?: string;
    projectPage?: string;
  }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const parsed = exportRangeSchema.safeParse({
    from: sp.from || undefined,
    to: sp.to || undefined,
  });
  const range = parsed.success ? resolveExportRange(parsed.data, now) : null;
  if (!range)
    return (
      <QueryInputError
        message={
          parsed.success
            ? "Tanggal mulai harus sebelum tanggal akhir."
            : (parsed.error.issues[0]?.message ??
              "Rentang tanggal tidak valid.")
        }
        resetHref={ADMIN_ROUTES.timesheet}
      />
    );
  const { from, to } = range;

  const userPage = parsePage(sp.userPage),
    projectPage = parsePage(sp.projectPage);
  const data = await getTimesheetSummary(from, to, userPage, projectPage);
  const fmtHours = (seconds: number) => `${(seconds / 3600).toFixed(1)} jam`;

  return (
    <div className="space-y-6">
      <AdminBanner
        data-admin-page-header
        className="flex flex-wrap items-center justify-between gap-4"
        category="projects"
        mascot={<AdminMascot pose="activity" size="header" />}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timesheet</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(from)} — {formatDate(to)}
          </p>
        </div>
      </AdminBanner>

      <TimesheetFilters
        from={from.toISOString().slice(0, 10)}
        to={to.toISOString().slice(0, 10)}
      />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Total Jam"
          value={`${data.totalHours} jam`}
          helper="Akumulasi durasi kerja"
          icon={Clock}
          artwork="tech-backend"
          toneClassName="border-primary/20 bg-primary/10 text-primary"
        />
        <AdminStatCard
          label="Dapat Ditagihkan"
          value={`${data.billableHours} jam (${data.billableRate}%)`}
          helper="Jam kerja dapat ditagihkan"
          icon={DollarSign}
          artwork="service-commerce"
          toneClassName="border-sky-200 bg-sky-50 text-sky-700"
        />
        <AdminStatCard
          label="Estimasi Pendapatan"
          value={`Rp ${data.estimatedRevenue.toLocaleString("id-ID")}`}
          helper="Estimasi nilai jam billable"
          icon={Briefcase}
          artwork="service-seo"
          toneClassName="border-emerald-200 bg-emerald-50 text-emerald-700"
        />
        <AdminStatCard
          label="Pencatatan"
          value={data.entryCount}
          helper="Total sesi log tercatat"
          icon={Users}
          artwork="service-consulting"
          toneClassName="border-amber-200 bg-amber-50 text-amber-700"
        />
      </div>

      {/* Per-user table */}
      <Card>
        <CardHeader>
          <CardTitle>Per Anggota Tim</CardTitle>
        </CardHeader>
        <CardContent>
          {data.userSummary.length === 0 ? (
            <AdminEmptyState context="timesheet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Dapat Ditagihkan</TableHead>
                  <TableHead className="text-right">Pencatatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.userSummary.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-right">
                      {fmtHours(u.totalSec)}
                    </TableCell>
                    <TableCell className="text-right">
                      {fmtHours(u.billableSec)}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {u.totalSec > 0
                          ? Math.round((u.billableSec / u.totalSec) * 100)
                          : 0}
                        %
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{u.entries}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <DataPagination
          currentPage={userPage}
          totalItems={data.totalUsers}
          pageSize={TIMESHEET_PAGE_SIZE}
          pageParam="userPage"
        />
      </Card>

      {/* Per-project table */}
      <Card>
        <CardHeader>
          <CardTitle>Per Proyek</CardTitle>
        </CardHeader>
        <CardContent>
          {data.projectSummary.length === 0 ? (
            <AdminEmptyState context="timesheet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyek</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Dapat Ditagihkan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.projectSummary.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="text-right">
                      {fmtHours(p.totalSec)}
                    </TableCell>
                    <TableCell className="text-right">
                      {fmtHours(p.billableSec)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <DataPagination
          currentPage={projectPage}
          totalItems={data.totalProjects}
          pageSize={TIMESHEET_PAGE_SIZE}
          pageParam="projectPage"
        />
      </Card>
    </div>
  );
}
