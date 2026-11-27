import { AdminEmptyState } from "@/app/admin/_components/admin-empty-state";
import { AdminBanner } from "@/app/admin/_components/admin-banner";
import { RevenueAreaChart } from "@/components/dashboard/analytics-charts";
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
import { AdminMascot } from "../../_components/admin-mascot";
import { AdminStatCard } from "../../_components/admin-stat-card";

import type { AdminAnalyticsData } from "../_data/analytics";

export function AnalyticsContent({ data }: { data: AdminAnalyticsData }) {
  return (
    <div className="space-y-6">
      <AdminBanner
        data-admin-page-header
        className="flex flex-wrap items-center justify-between gap-4"
        category="analytics"
        mascot={<AdminMascot pose="vision" size="header" />}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pendapatan & Profitabilitas
          </h1>
          <p className="text-sm text-muted-foreground">
            Analisis performa bisnis Aldera Tech
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <a href={API_ROUTES.exportAnalytics} download>
              <Download className="size-3.5" /> Unduh CSV
            </a>
          </Button>
        </div>
      </AdminBanner>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Total Pendapatan"
          value={formatCurrency(data.totalRevenue)}
          helper="Seluruh invoice berstatus lunas"
          icon={DollarSign}
          artwork="service-seo"
          toneClassName="border-emerald-200 bg-emerald-50 text-emerald-700"
        />
        <AdminStatCard
          label="Rasio Pelunasan"
          value={`${data.collectionRate}%`}
          helper="Rasio pelunasan tagihan"
          icon={Percent}
          artwork="service-quality"
          toneClassName="border-primary/20 bg-primary/10 text-primary"
        />
        <AdminStatCard
          label="Rata-rata Durasi Proyek"
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
          <CardTitle>Pendapatan Bulanan (12 bulan)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.monthlyRevenue.length === 0 ? (
            <AdminEmptyState context="revenue" />
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
            <AdminEmptyState context="revenue" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyek</TableHead>
                  <TableHead className="text-right">Pendapatan</TableHead>
                  <TableHead className="text-right">Biaya (jam)</TableHead>
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
                      {formatCurrency(p.cost)} ({p.hours} jam)
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
            <Users className="size-4" /> Nilai Pembayaran Klien (10 Teratas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.clientLTV.length === 0 ? (
            <AdminEmptyState context="clients" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Klien</TableHead>
                  <TableHead className="text-right">Total Dibayarkan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.clientLTV.map((c) => (
                  <TableRow key={c.id}>
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
