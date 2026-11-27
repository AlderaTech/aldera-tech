import { prisma } from "@/lib/prisma";

type ProjectRevenue = {
  id: string;
  title: string;
  revenue: number;
  seconds: number;
};
type ClientRevenue = { id: string; name: string; ltv: number };

export async function getAdminAnalytics() {
  const now = new Date();
  const months = Array.from(
    { length: 12 },
    (_, i) => new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
  );
  const [
    settings,
    revenue,
    paid,
    issued,
    totalProjects,
    duration,
    clientLTV,
    monthTotals,
  ] = await Promise.all([
    prisma.siteSetting.findUnique({
      where: { id: "site" },
      select: { hourlyRate: true },
    }),
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    }),
    prisma.invoice.count({ where: { status: "PAID" } }),
    prisma.invoice.count({
      where: { status: { in: ["SENT", "PAID", "OVERDUE"] } },
    }),
    prisma.project.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.$queryRaw<
      { days: number | null }[]
    >`SELECT AVG(EXTRACT(EPOCH FROM ("completedAt" - "createdAt")) / 86400)::float8 AS days FROM "Project" WHERE status <> 'CANCELLED' AND "completedAt" IS NOT NULL`,
    prisma.$queryRaw<
      ClientRevenue[]
    >`SELECT u.id, u.name, SUM(i.total)::float8 AS ltv FROM "Invoice" i JOIN "User" u ON u.id=i."clientId" WHERE i.status='PAID' GROUP BY u.id,u.name ORDER BY SUM(i.total) DESC,u.id ASC LIMIT 10`,
    Promise.all(
      months.map((from) =>
        prisma.invoice.aggregate({
          where: {
            status: "PAID",
            paidAt: {
              gte: from,
              lt: new Date(from.getFullYear(), from.getMonth() + 1, 1),
            },
          },
          _sum: { total: true },
        })
      )
    ),
  ]);
  const hourlyRate = Number(settings?.hourlyRate ?? 150000);
  const projects = await prisma.$queryRaw<ProjectRevenue[]>`
    WITH revenue AS (SELECT "projectId",SUM(total) AS amount FROM "Invoice" WHERE status='PAID' GROUP BY "projectId"),
    hours AS (SELECT "projectId", SUM("durationSec") AS seconds FROM "TimeEntry" WHERE billable=true GROUP BY "projectId")
    SELECT p.id,p.title,COALESCE(r.amount,0)::float8 AS revenue,COALESCE(h.seconds,0)::float8 AS seconds
    FROM "Project" p LEFT JOIN revenue r ON r."projectId"=p.id LEFT JOIN hours h ON h."projectId"=p.id
    WHERE p.status <> 'CANCELLED' AND (COALESCE(r.amount,0)>0 OR COALESCE(h.seconds,0)>=180)
    ORDER BY COALESCE(r.amount,0)-COALESCE(h.seconds,0)::numeric/3600*${hourlyRate} DESC,p.id ASC LIMIT 10
  `;
  return {
    totalRevenue: Number(revenue._sum.total ?? 0),
    collectionRate: issued ? Math.round((paid / issued) * 100) : 0,
    totalProjects,
    avgDurationDays: Math.round(duration[0]?.days ?? 0),
    clientLTV,
    monthlyRevenue: months.map((date, i) => ({
      month: date.toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
      }),
      revenue: Number(monthTotals[i]._sum.total ?? 0),
    })),
    projectProfitability: projects.map((p) => {
      const cost = (p.seconds / 3600) * hourlyRate,
        profit = p.revenue - cost;
      return {
        id: p.id,
        title: p.title,
        revenue: p.revenue,
        cost,
        profit,
        margin: p.revenue > 0 ? Math.round((profit / p.revenue) * 100) : 0,
        hours: +(p.seconds / 3600).toFixed(1),
      };
    }),
  };
}

export type AdminAnalyticsData = Awaited<ReturnType<typeof getAdminAnalytics>>;
