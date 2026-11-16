import { prisma } from "@/lib/prisma";

export const TIMESHEET_PAGE_SIZE = 20;

export async function getTimesheetSummary(
  from: Date,
  to: Date,
  userPage: number,
  projectPage: number
) {
  const where = { startedAt: { gte: from, lte: to } };
  const [totals, billable, userGroups, projectGroups, sizes, settings] =
    await Promise.all([
      prisma.timeEntry.aggregate({
        where,
        _sum: { durationSec: true },
        _count: { _all: true },
      }),
      prisma.timeEntry.aggregate({
        where: { ...where, billable: true },
        _sum: { durationSec: true },
      }),
      prisma.timeEntry.groupBy({
        by: ["userId"],
        where,
        _sum: { durationSec: true },
        _count: { _all: true },
        orderBy: [{ _sum: { durationSec: "desc" } }, { userId: "asc" }],
        skip: (userPage - 1) * TIMESHEET_PAGE_SIZE,
        take: TIMESHEET_PAGE_SIZE,
      }),
      prisma.timeEntry.groupBy({
        by: ["projectId"],
        where,
        _sum: { durationSec: true },
        orderBy: [{ _sum: { durationSec: "desc" } }, { projectId: "asc" }],
        skip: (projectPage - 1) * TIMESHEET_PAGE_SIZE,
        take: TIMESHEET_PAGE_SIZE,
      }),
      prisma.$queryRaw<
        { users: number; projects: number }[]
      >`SELECT COUNT(DISTINCT "userId")::int AS users, COUNT(DISTINCT "projectId")::int AS projects FROM "TimeEntry" WHERE "startedAt" >= ${from} AND "startedAt" <= ${to}`,
      prisma.siteSetting.findUnique({
        where: { id: "site" },
        select: { hourlyRate: true },
      }),
    ]);
  const userIds = userGroups.map((g) => g.userId),
    projectIds = projectGroups.map((g) => g.projectId);
  const [users, projects, userBillable, projectBillable] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    }),
    prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, title: true },
    }),
    prisma.timeEntry.groupBy({
      by: ["userId"],
      where: { ...where, billable: true, userId: { in: userIds } },
      _sum: { durationSec: true },
    }),
    prisma.timeEntry.groupBy({
      by: ["projectId"],
      where: { ...where, billable: true, projectId: { in: projectIds } },
      _sum: { durationSec: true },
    }),
  ]);
  const seconds = totals._sum.durationSec ?? 0,
    billableSeconds = billable._sum.durationSec ?? 0;
  return {
    totalHours: +(seconds / 3600).toFixed(1),
    billableHours: +(billableSeconds / 3600).toFixed(1),
    billableRate: seconds ? Math.round((billableSeconds / seconds) * 100) : 0,
    estimatedRevenue:
      (billableSeconds / 3600) * Number(settings?.hourlyRate ?? 150000),
    entryCount: totals._count?._all ?? 0,
    totalUsers: sizes[0]?.users ?? 0,
    totalProjects: sizes[0]?.projects ?? 0,
    userSummary: userGroups.map((g) => ({
      id: g.userId,
      name:
        users.find((u) => u.id === g.userId)?.name ?? "Pengguna tidak tersedia",
      totalSec: g._sum.durationSec ?? 0,
      billableSec:
        userBillable.find((b) => b.userId === g.userId)?._sum.durationSec ?? 0,
      entries: g._count._all,
    })),
    projectSummary: projectGroups.map((g) => ({
      id: g.projectId,
      title:
        projects.find((p) => p.id === g.projectId)?.title ??
        "Proyek tidak tersedia",
      totalSec: g._sum.durationSec ?? 0,
      billableSec:
        projectBillable.find((b) => b.projectId === g.projectId)?._sum
          .durationSec ?? 0,
    })),
  };
}
