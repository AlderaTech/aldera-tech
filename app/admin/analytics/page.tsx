import { RevenueAreaChart } from "@/components/dashboard/analytics-charts";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatCurrency } from "@/lib/utils";
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
import {
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Percent,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_ROUTES } from "@/lib/routes";
import { AdminMascot } from "../_components/admin-mascot";
import { AdminStatCard } from "../_components/admin-stat-card";

export default async function AnalyticsPage() {
  const data = await safeDb(
    async () => {
      const settings = await prisma.siteSetting.findUnique({
        where: { id: "site" },
        select: { hourlyRate: true },
      });
      const hourlyRate = Number(settings?.hourlyRate ?? 150000);

      const [invoices, projects, timeEntries] = await Promise.all([
        prisma.invoice.findMany({
          select: {
            id: true,
            total: true,
            status: true,
            clientId: true,
            projectId: true,
            paidAt: true,
            issueDate: true,
          },
        }),
        prisma.project.findMany({
          select: {
            id: true,
            title: true,
            clientId: true,
            status: true,
            budget: true,
            createdAt: true,
            completedAt: true,
          },
          where: { status: { not: "CANCELLED" } },
        }),
        prisma.timeEntry.findMany({
          where: { billable: true },
          select: { projectId: true, durationSec: true },
        }),
      ]);

      // Revenue metrics
      const paidInvoices = invoices.filter((i) => i.status === "PAID");
      const sentInvoices = invoices.filter(
        (i) =>
          i.status === "SENT" || i.status === "PAID" || i.status === "OVERDUE"
      );
      const totalRevenue = paidInvoices.reduce(
        (s, i) => s + Number(i.total),
        0
      );
      const collectionRate =
        sentInvoices.length > 0
          ? Math.round((paidInvoices.length / sentInvoices.length) * 100)
          : 0;

      // Monthly revenue (last 12 months)
      const now = new Date();
      const monthlyRevenue: { month: string; revenue: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString("id-ID", {
          month: "short",
          year: "2-digit",
        });
        const monthPaid = paidInvoices.filter((inv) => {
          if (!inv.paidAt) return false;
          return (
            inv.paidAt.getFullYear() === d.getFullYear() &&
            inv.paidAt.getMonth() === d.getMonth()
          );
        });
        monthlyRevenue.push({
          month: label,
          revenue: monthPaid.reduce((s, i) => s + Number(i.total), 0),
        });
      }

      // Project profitability
      const timeCostByProject = new Map<string, number>();
      for (const e of timeEntries) {
        timeCostByProject.set(
          e.projectId,
          (timeCostByProject.get(e.projectId) ?? 0) + e.durationSec
        );
      }

      const projectProfitability = projects
        .map((p) => {
          const projectInvoices = paidInvoices.filter(
            (i) => i.projectId === p.id
          );
          const revenue = projectInvoices.reduce(
            (s, i) => s + Number(i.total),
            0
          );
          const timeSec = timeCostByProject.get(p.id) ?? 0;
          const cost = (timeSec / 3600) * hourlyRate;
          const profit = revenue - cost;
          const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
          return {
            id: p.id,
            title: p.title,
            revenue,
            cost,
            profit,
            margin,
            hours: +(timeSec / 3600).toFixed(1),
          };
        })
        .filter((p) => p.revenue > 0 || p.hours > 0)
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 10);

      // Client Lifetime Value
      const clientRevenue = new Map<string, number>();
      for (const inv of paidInvoices) {
        clientRevenue.set(
          inv.clientId,
          (clientRevenue.get(inv.clientId) ?? 0) + Number(inv.total)
        );
      }
      const clients = await prisma.user.findMany({
        where: { id: { in: [...clientRevenue.keys()] } },
        select: { id: true, name: true },
      });
      const clientLTV = clients
        .map((c) => ({
          name: c.name,
          ltv: clientRevenue.get(c.id) ?? 0,
        }))
        .sort((a, b) => b.ltv - a.ltv)
        .slice(0, 10);

      // Average project duration (completed projects)
      const completed = projects.filter((p) => p.completedAt);
      const avgDurationDays =
        completed.length > 0
          ? Math.round(
              completed.reduce(
                (s, p) =>
                  s +
                  (p.completedAt!.getTime() - p.createdAt.getTime()) /
                    (1000 * 60 * 60 * 24),
                0
              ) / completed.length
            )
          : 0;

      return {
        totalRevenue,
        collectionRate,
        monthlyRevenue,
        projectProfitability,
        clientLTV,
        avgDurationDays,
        totalProjects: projects.length,
      };
    },
    {
      totalRevenue: 0,
      collectionRate: 0,
      monthlyRevenue: [],
      projectProfitability: [],
      clientLTV: [],
      avgDurationDays: 0,
      totalProjects: 0,
    }
  );

  return (
    <div className="space-y-6">
      <div
        data-admin-page-header
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Revenue & Profitability
          </h1>
          <p className="text-sm text-muted-foreground">
            Analisis performa bisnis Aldera Tech
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AdminMascot pose="vision" size="header" />
          <Button asChild variant="outline" size="sm">
            <a href={API_ROUTES.exportAnalytics} download>
              <Download className="size-3.5" /> Export CSV
            </a>
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          helper="Seluruh invoice berstatus paid"
          icon={DollarSign}
          artwork="service-seo"
          toneClassName="border-emerald-200 bg-emerald-50 text-emerald-700"
        />
        <AdminStatCard
          label="Collection Rate"
          value={`${data.collectionRate}%`}
          helper="Rasio pelunasan tagihan"
          icon={Percent}
          artwork="service-quality"
          toneClassName="border-primary/20 bg-primary/10 text-primary"
        />
        <AdminStatCard
          label="Avg. Durasi Proyek"
          value={`${data.avgDurationDays} hari`}
          helper="Rata-rata waktu penyelesaian"
          icon={BarChart3}
          artwork="tech-backend"
          toneClassName="border-sky-200 bg-sky-50 text-sky-700"
        />
        <AdminStatCard
          label="Total Proyek"
          value={data.totalProjects}
          helper="Proyek aktif & selesai"
          icon={TrendingUp}
          artwork="tech-web"
          toneClassName="border-amber-200 bg-amber-50 text-amber-700"
        />
      </div>

      {/* Monthly revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Bulanan (12 bulan)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.monthlyRevenue.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data.</p>
          ) : (
            <RevenueAreaChart data={data.monthlyRevenue} animate={false} />
          )}
        </CardContent>
      </Card>

      {/* Project profitability */}
      <Card>
        <CardHeader>
          <CardTitle>Profitabilitas Proyek (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.projectProfitability.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyek</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Cost (jam)</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.projectProfitability.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(p.revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(p.cost)} ({p.hours}h)
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          p.profit >= 0 ? "text-success" : "text-destructive"
                        }
                      >
                        {formatCurrency(p.profit)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          p.margin >= 50
                            ? "default"
                            : p.margin >= 0
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {p.margin}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Client LTV */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4" /> Client Lifetime Value (Top 10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.clientLTV.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Total Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.clientLTV.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(c.ltv)}
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
