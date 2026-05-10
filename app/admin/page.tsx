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
  ArrowUpRight,
  CheckCircle2,
  FolderClosed,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import {
  RevenueAreaChart,
  ProjectStatusPie,
  TopClientsBar,
} from "@/components/dashboard/analytics-charts";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { formatDate } from "@/lib/utils";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export default async function AdminOverview() {
  const session = await auth();

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
      helper: "Seluruh pipeline delivery",
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      icon: Loader2,
      label: "Proyek Aktif",
      value: stats.active,
      helper: "Sedang dikerjakan tim",
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      icon: Clock,
      label: "Invoice Pending",
      value: stats.pending,
      helper: "Perlu follow up pembayaran",
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: stats.revenue,
      helper: "Invoice berstatus paid",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      isCurrency: true,
    },
  ];

  const quickActions = [
    {
      href: ADMIN_ROUTES.projectNew,
      label: "Proyek Baru",
      icon: Plus,
      permission: PERMISSIONS.PROJECT_CREATE,
    },
    {
      href: ADMIN_ROUTES.proposalNew,
      label: "Proposal Baru",
      icon: FileText,
      permission: PERMISSIONS.PROPOSAL_MANAGE,
    },
    {
      href: ADMIN_ROUTES.invoiceNew,
      label: "Invoice Baru",
      icon: FileText,
      permission: PERMISSIONS.INVOICE_CREATE,
    },
    {
      href: ADMIN_ROUTES.blogNew,
      label: "Post Baru",
      icon: Newspaper,
      permission: PERMISSIONS.BLOG_CREATE,
    },
  ].filter((action) => hasPermission(session?.user.role, action.permission));

  const operationalCards = [
    {
      label: "Delivery aktif",
      value: stats.active,
      icon: CheckCircle2,
      href: ADMIN_ROUTES.projects,
      permission: PERMISSIONS.PROJECT_VIEW_ALL,
    },
    {
      label: "Invoice terbuka",
      value: stats.pending,
      icon: FileText,
      href: ADMIN_ROUTES.invoices,
      permission: PERMISSIONS.INVOICE_VIEW,
    },
    {
      label: "File workspace",
      value: "Manager",
      icon: FolderClosed,
      href: ADMIN_ROUTES.files,
      permission: PERMISSIONS.FILE_MANAGE,
    },
  ].filter((item) => hasPermission(session?.user.role, item.permission));

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <div className="mb-2 inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Admin Console
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 xxxl:text-3xl">
              Dashboard operasional Solvo Tech
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Pantau proyek, invoice, konten, dan aktivitas tim dari satu area
              kerja yang ringkas.
            </p>
          </div>
          {quickActions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {quickActions.slice(0, 3).map((action, index) => (
                <Button
                  key={action.href}
                  asChild
                  variant={index === 0 ? "default" : "outline"}
                  size="sm"
                  className="h-9"
                >
                  <Link href={action.href}>
                    <action.icon className="size-4" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <Card
            key={s.label}
            className="border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex size-10 items-center justify-center rounded-lg border ${s.color}`}
              >
                <s.icon className="size-5" />
              </div>
              <ArrowUpRight className="size-4 text-slate-300" />
            </div>
            <div className="mt-4 space-y-1">
              <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                {s.label}
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-950 xxxl:text-3xl">
                <AnimatedCounter
                  value={s.value}
                  format={s.isCurrency ? "currency" : "number"}
                />
              </div>
              <p className="text-xs text-slate-500">{s.helper}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4" />
              Revenue 12 Bulan Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={analytics.revenueSeries} />
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="size-4" />
              Status Proyek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectStatusPie data={analytics.statusData} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-primary" />
                Top 5 Client by Revenue
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Ranking client berdasarkan invoice berstatus paid.
              </p>
            </div>
            <div className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {analytics.clientsData.length} client
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <TopClientsBar data={analytics.clientsData} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-200 bg-slate-50/70 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="size-4 text-primary" />
                  Aktivitas Terbaru
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Riwayat perubahan terbaru dari proyek dan sistem.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                {recent.length} log
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada aktivitas.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
              {recent.slice(0, 6).map((a) => (
                <div
                  key={a.id}
                  className="grid gap-3 p-4 transition-colors hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10">
                      <span className="size-2 rounded-full bg-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-medium text-slate-950">
                        {a.description}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500">
                        <span>{a.user.name}</span>
                        {a.project && (
                          <>
                            <span>•</span>
                            <Link
                              href={ADMIN_ROUTES.projectDetail(a.project.id)}
                              className="font-medium text-slate-700 underline-offset-2 hover:text-primary hover:underline"
                            >
                              {a.project.title}
                            </Link>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 sm:justify-self-end">
                      {formatDate(a.createdAt, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </div>
                </div>
              ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-200 bg-slate-50/80 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="size-4 text-primary" />
                  Panel Operasional
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Ringkasan kerja rutin dan pintasan aksi admin.
                </p>
              </div>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                Live
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-2">
              {operationalCards.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-xs transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <item.icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-900">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      Buka halaman terkait
                    </span>
                  </span>
                  <span className="inline-flex min-w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-900">
                    {item.value}
                  </span>
                </Link>
              ))}
            </div>

            {quickActions.length > 0 && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Aksi Cepat
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Buat data baru dari panel ini.
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 text-slate-400" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.href}
                      asChild
                      variant="outline"
                      className="h-10 justify-start border-slate-200 bg-white text-slate-800 shadow-xs hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    >
                      <Link href={action.href}>
                        <action.icon className="size-4" />
                        {action.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
