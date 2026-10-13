import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";

export type AdminOverviewStats = {
  total: number;
  active: number;
  pending: number;
  orderPending: number;
  revenue: number;
};

export type AdminOverviewAnalytics = {
  revenueSeries: { month: string; revenue: number }[];
  statusData: { name: string; value: number }[];
  clientsData: { name: string; revenue: number }[];
};

export type AdminRecentActivity = {
  id: string;
  description: string;
  createdAt: Date;
  user: { name: string | null };
  project: { id: string; title: string } | null;
};

const EMPTY_STATS: AdminOverviewStats = {
  total: 0,
  active: 0,
  pending: 0,
  orderPending: 0,
  revenue: 0,
};

const EMPTY_ANALYTICS: AdminOverviewAnalytics = {
  revenueSeries: [],
  statusData: [],
  clientsData: [],
};

export async function getAdminOverviewData() {
  const [stats, recent, analytics] = await Promise.all([
    getOverviewStats(),
    getRecentActivities(),
    getOverviewAnalytics(),
  ]);

  return { stats, recent, analytics };
}

async function getOverviewStats() {
  return safeDb(async () => {
    const [total, active, pending, orderPending, invoices] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "IN_PROGRESS" } }),
      prisma.invoice.count({ where: { status: { in: ["SENT", "OVERDUE"] } } }),
      prisma.orderRequest.count({ where: { status: "PENDING" } }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { status: "PAID" },
      }),
    ]);

    return {
      total,
      active,
      pending,
      orderPending,
      revenue: Number(invoices._sum.total ?? 0),
    };
  }, EMPTY_STATS);
}

async function getRecentActivities() {
  return safeDb<AdminRecentActivity[]>(
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
}

async function getOverviewAnalytics() {
  return safeDb(async () => {
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

    const revenueSeries = buildRevenueSeries(paidInvoices);
    const statusData = statusGroups.map((group) => ({
      name: PROJECT_STATUS_LABELS[group.status] ?? group.status,
      value: group._count._all,
    }));
    const clientsData = await buildClientRevenueSeries(topClients);

    return { revenueSeries, statusData, clientsData };
  }, EMPTY_ANALYTICS);
}

function buildRevenueSeries(
  paidInvoices: { total: unknown; paidAt: Date | null }[]
) {
  const now = new Date();
  const months: { key: string; month: string; revenue: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: MONTH_LABELS[date.getMonth()],
      revenue: 0,
    });
  }

  for (const invoice of paidInvoices) {
    if (!invoice.paidAt) continue;
    const key = `${invoice.paidAt.getFullYear()}-${invoice.paidAt.getMonth()}`;
    const bucket = months.find((month) => month.key === key);
    if (bucket) bucket.revenue += Number(invoice.total);
  }

  return months.map(({ month, revenue }) => ({ month, revenue }));
}

async function buildClientRevenueSeries(
  topClients: { clientId: string; _sum: { total: unknown } }[]
) {
  const clientIds = topClients.map((client) => client.clientId);
  const clientNames = clientIds.length
    ? await prisma.user.findMany({
        where: { id: { in: clientIds } },
        select: { id: true, name: true, company: true },
      })
    : [];
  const nameById = new Map(
    clientNames.map((user) => [user.id, user.company || user.name])
  );

  return topClients.map((client) => ({
    name: nameById.get(client.clientId) ?? "Tidak tersedia",
    revenue: Number(client._sum.total ?? 0),
  }));
}

const MONTH_LABELS = [
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

const PROJECT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "Berjalan",
  REVIEW: "Review",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};
