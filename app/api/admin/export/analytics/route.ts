import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { csvResponse, toCsv } from "@/lib/csv";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const roles =
    session?.user?.roles ?? (session?.user?.role ? [session.user.role] : []);
  if (!session?.user || !hasPermission(roles, PERMISSIONS.ANALYTICS_VIEW)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await prisma.siteSetting.findUnique({
    where: { id: "site" },
    select: { hourlyRate: true },
  });
  const hourlyRate = Number(settings?.hourlyRate ?? 150000);

  const [invoices, projects, timeEntries] = await Promise.all([
    prisma.invoice.findMany({
      where: { status: "PAID" },
      select: { total: true, projectId: true },
    }),
    prisma.project.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { id: true, title: true },
    }),
    prisma.timeEntry.findMany({
      where: { billable: true },
      select: { projectId: true, durationSec: true },
    }),
  ]);

  const revenueByProject = new Map<string, number>();
  for (const inv of invoices) {
    if (inv.projectId)
      revenueByProject.set(
        inv.projectId,
        (revenueByProject.get(inv.projectId) ?? 0) + Number(inv.total)
      );
  }
  const costByProject = new Map<string, number>();
  for (const e of timeEntries) {
    costByProject.set(
      e.projectId,
      (costByProject.get(e.projectId) ?? 0) + e.durationSec
    );
  }

  const rows = projects
    .map((p) => {
      const revenue = revenueByProject.get(p.id) ?? 0;
      const timeSec = costByProject.get(p.id) ?? 0;
      const cost = (timeSec / 3600) * hourlyRate;
      const profit = revenue - cost;
      const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
      return {
        project: p.title,
        revenue: revenue.toFixed(0),
        hours: (timeSec / 3600).toFixed(1),
        cost: cost.toFixed(0),
        profit: profit.toFixed(0),
        marginPct: margin,
      };
    })
    .sort((a, b) => Number(b.profit) - Number(a.profit));

  const csv = toCsv(rows);
  return csvResponse(
    csv,
    `analytics-profitability-${new Date().toISOString().slice(0, 10)}.csv`
  );
}
