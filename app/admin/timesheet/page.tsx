import { AdminEmptyState } from "@/app/admin/_components/admin-empty-state";
import { AdminBanner } from "@/app/admin/_components/admin-banner";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
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

export default async function TimesheetPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const from = sp.from
    ? new Date(sp.from)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const to = sp.to ? new Date(sp.to) : now;
  if (sp.to) {
    to.setHours(23, 59, 59, 999);
  }

  const data = await safeDb(
    async () => {
      const entries = await prisma.timeEntry.findMany({
        where: { startedAt: { gte: from, lte: to } },
        include: {
          user: { select: { id: true, name: true } },
          project: { select: { id: true, title: true } },
        },
      });

      const settings = await prisma.siteSetting.findUnique({
        where: { id: "site" },
        select: { hourlyRate: true },
      });
      const hourlyRate = Number(settings?.hourlyRate ?? 150000);

      // Group by user
      const byUser = new Map<
        string,
        { name: string; totalSec: number; billableSec: number; entries: number }
      >();
      const byProject = new Map<
        string,
        { title: string; totalSec: number; billableSec: number }
      >();

      for (const e of entries) {
        const uid = e.user.id;
        const existing = byUser.get(uid) ?? {
          name: e.user.name,
          totalSec: 0,
          billableSec: 0,
          entries: 0,
        };
        existing.totalSec += e.durationSec;
        if (e.billable) existing.billableSec += e.durationSec;
        existing.entries++;
        byUser.set(uid, existing);

        const pid = e.project.id;
        const proj = byProject.get(pid) ?? {
          title: e.project.title,
          totalSec: 0,
          billableSec: 0,
        };
        proj.totalSec += e.durationSec;
        if (e.billable) proj.billableSec += e.durationSec;
        byProject.set(pid, proj);
      }

      const totalSec = entries.reduce((s, e) => s + e.durationSec, 0);
      const billableSec = entries
        .filter((e) => e.billable)
        .reduce((s, e) => s + e.durationSec, 0);

      return {
        totalHours: +(totalSec / 3600).toFixed(1),
        billableHours: +(billableSec / 3600).toFixed(1),
        billableRate:
          totalSec > 0 ? Math.round((billableSec / totalSec) * 100) : 0,
        estimatedRevenue: Math.round((billableSec / 3600) * hourlyRate),
        userSummary: [...byUser.values()].sort(
          (a, b) => b.totalSec - a.totalSec
        ),
        projectSummary: [...byProject.values()].sort(
          (a, b) => b.totalSec - a.totalSec
        ),
        entryCount: entries.length,
      };
    },
    {
      totalHours: 0,
      billableHours: 0,
      billableRate: 0,
      estimatedRevenue: 0,
      userSummary: [],
      projectSummary: [],
      entryCount: 0,
    }
  );

  const fmtHours = (sec: number) => `${(sec / 3600).toFixed(1)} jam`;

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
          label="Billable"
          value={`${data.billableHours} jam (${data.billableRate}%)`}
          helper="Jam kerja dapat ditagihkan"
          icon={DollarSign}
          artwork="service-commerce"
          toneClassName="border-sky-200 bg-sky-50 text-sky-700"
        />
        <AdminStatCard
          label="Est. Revenue"
          value={`Rp ${data.estimatedRevenue.toLocaleString("id-ID")}`}
          helper="Estimasi nilai jam billable"
          icon={Briefcase}
          artwork="service-seo"
          toneClassName="border-emerald-200 bg-emerald-50 text-emerald-700"
        />
        <AdminStatCard
          label="Entries"
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
                  <TableHead className="text-right">Billable</TableHead>
                  <TableHead className="text-right">Entries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.userSummary.map((u) => (
                  <TableRow key={u.name}>
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
                  <TableHead className="text-right">Billable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.projectSummary.map((p) => (
                  <TableRow key={p.title}>
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
      </Card>
    </div>
  );
}
