import Link from "next/link";
import {
  FolderKanban,
  Loader2,
  DollarSign,
  Clock,
  Plus,
  Newspaper,
  FileText,
  Activity,
  TrendingUp,
  PieChart,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import {
  RevenueAreaChart,
  ProjectStatusPie,
  TopClientsBar,
} from "@/components/dashboard/analytics-charts";
import { DarkModePreview } from "@/components/dashboard/dark-mode-preview";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatDate } from "@/lib/utils";

export default async function AdminOverview() {
  const stats = await safeDb(
    async () => {
      const [total, active, pending, invoices] = await Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { status: "IN_PROGRESS" } }),
        prisma.invoice.count({ where: { status: { in: ["SENT", "OVERDUE"] } } }),
        prisma.invoice.aggregate({
          _sum: { total: true },
          where: { status: "PAID" },
        }),
      ]);
      return {
        total,
        active,
        pending,
        revenue: Number(invoices._sum.total ?? 0),
      };
    },
    { total: 0, active: 0, pending: 0, revenue: 0 }
  );

  const recent = await safeDb(
    async () =>
      await prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: { select: { name: true } },
          project: { select: { title: true, id: true } },
        },
      }),
    []
  );

  // Analytics: last 12 months revenue + project status distribution + top 5 clients
  const analytics = await safeDb(
    async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const [paidInvoices, statusGroups, topClients] = await Promise.all([
        prisma.invoice.findMany({
          where: { status: "PAID", paidAt: { gte: start } },
          select: { total: true, paidAt: true },
        }),
        prisma.project.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
        prisma.invoice.groupBy({
          by: ["clientId"],
          where: { status: "PAID" },
          _sum: { total: true },
          orderBy: { _sum: { total: "desc" } },
          take: 5,
        }),
      ]);

      // Build 12-month revenue series
      const monthLabels = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Ags",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      const months: { key: string; month: string; revenue: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          key: `${d.getFullYear()}-${d.getMonth()}`,
          month: monthLabels[d.getMonth()],
          revenue: 0,
        });
      }
      for (const inv of paidInvoices) {
        if (!inv.paidAt) continue;
        const key = `${inv.paidAt.getFullYear()}-${inv.paidAt.getMonth()}`;
        const bucket = months.find((m) => m.key === key);
        if (bucket) bucket.revenue += Number(inv.total);
      }

      const statusMeta: Record<string, string> = {
        PENDING: "Pending",
        IN_PROGRESS: "Berjalan",
        REVIEW: "Review",
        COMPLETED: "Selesai",
        CANCELLED: "Dibatalkan",
      };
      const statusData = statusGroups.map((g) => ({
        name: statusMeta[g.status] ?? g.status,
        value: g._count._all,
      }));

      const clientIds = topClients.map((t) => t.clientId);
      const clientNames = clientIds.length
        ? await prisma.user.findMany({
            where: { id: { in: clientIds } },
            select: { id: true, name: true, company: true },
          })
        : [];
      const nameById = new Map(
        clientNames.map((u) => [u.id, u.company || u.name])
      );
      const clientsData = topClients.map((t) => ({
        name: nameById.get(t.clientId) ?? "Tidak tersedia",
        revenue: Number(t._sum.total ?? 0),
      }));

      return {
        revenueSeries: months.map(({ month, revenue }) => ({ month, revenue })),
        statusData,
        clientsData,
      };
    },
    {
      revenueSeries: [] as { month: string; revenue: number }[],
      statusData: [] as { name: string; value: number }[],
      clientsData: [] as { name: string; revenue: number }[],
    }
  );

  const statCards = [
    {
      icon: FolderKanban,
      label: "Total Proyek",
      value: stats.total,
      color: "text-primary bg-primary/10",
    },
    {
      icon: Loader2,
      label: "Proyek Aktif",
      value: stats.active,
      color: "text-chart-2 bg-chart-2/10",
    },
    {
      icon: Clock,
      label: "Invoice Pending",
      value: stats.pending,
      color: "text-warning bg-warning/10",
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: stats.revenue,
      color: "text-success bg-success/10",
      isCurrency: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl xxxl:text-3xl font-bold tracking-tight">
            Admin Overview
          </h1>
          <p className="text-muted-foreground">
            Ringkasan aktivitas dan performa Solvo Tech.
          </p>
        </div>
        <DarkModePreview />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`size-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="size-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="text-2xl xxxl:text-3xl font-bold mt-1">
                <AnimatedCounter
                  value={s.value}
                  format={s.isCurrency ? "currency" : "number"}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4" />
              Revenue 12 Bulan Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={analytics.revenueSeries} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="size-4" />
              Status Proyek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectStatusPie data={analytics.statusData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4" />
            Top 5 Client by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TopClientsBar data={analytics.clientsData} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-4" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada aktivitas.
              </p>
            ) : (
              recent.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="size-2 mt-2 rounded-full bg-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{a.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.user.name}
                      {a.project && (
                        <>
                          {" • "}
                          <Link
                            href={`/admin/projects/${a.project.id}`}
                            className="hover:text-foreground underline-offset-2 hover:underline"
                          >
                            {a.project.title}
                          </Link>
                        </>
                      )}
                      {" • "}
                      {formatDate(a.createdAt, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/projects/new">
                <Plus className="size-4" /> Proyek Baru
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/invoices/new">
                <FileText className="size-4" /> Invoice Baru
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/blog/new">
                <Newspaper className="size-4" /> Post Baru
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
