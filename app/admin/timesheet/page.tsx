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
import { Clock, Users, Briefcase, DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_ROUTES } from "@/lib/routes";

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

  const fmtHours = (sec: number) => `${(sec / 3600).toFixed(1)}h`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timesheet</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(from)} — {formatDate(to)}
          </p>
        </div>
        <form className="flex items-end gap-2">
          <div>
            <label htmlFor="from" className="text-xs text-muted-foreground">
              Dari
            </label>
            <input
              id="from"
              type="date"
              name="from"
              defaultValue={from.toISOString().slice(0, 10)}
              className="block rounded border px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label htmlFor="to" className="text-xs text-muted-foreground">
              Sampai
            </label>
            <input
              id="to"
              type="date"
              name="to"
              defaultValue={to.toISOString().slice(0, 10)}
              className="block rounded border px-2 py-1 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground"
          >
            Filter
          </button>
          <Button asChild variant="outline" size="sm">
            <a
              href={API_ROUTES.exportTimesheetWithRange(
                from.toISOString().slice(0, 10),
                to.toISOString().slice(0, 10)
              )}
              download
            >
              <Download className="size-3.5" /> CSV
            </a>
          </Button>
        </form>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Jam</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalHours}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Billable</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.billableHours}h{" "}
              <span className="text-sm text-muted-foreground">
                ({data.billableRate}%)
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
            <Briefcase className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rp {data.estimatedRevenue.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entries</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.entryCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-user table */}
      <Card>
        <CardHeader>
          <CardTitle>Per Anggota Tim</CardTitle>
        </CardHeader>
        <CardContent>
          {data.userSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada data timesheet.
            </p>
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
            <p className="text-sm text-muted-foreground">Belum ada data.</p>
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
