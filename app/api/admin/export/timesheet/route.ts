import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { csvResponse, toCsv } from "@/lib/csv";
import { isStaff } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const from = sp.get("from")
    ? new Date(sp.get("from")!)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const to = sp.get("to") ? new Date(sp.get("to")!) : new Date();
  if (sp.get("to")) {
    to.setHours(23, 59, 59, 999);
  }

  const entries = await prisma.timeEntry.findMany({
    where: { startedAt: { gte: from, lte: to } },
    include: {
      user: { select: { name: true } },
      project: { select: { title: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  const rows = entries.map((e) => ({
    user: e.user.name,
    project: e.project.title,
    description: e.description,
    startedAt: e.startedAt.toISOString().slice(0, 16),
    endedAt: e.endedAt?.toISOString().slice(0, 16) ?? "",
    hours: (e.durationSec / 3600).toFixed(2),
    billable: e.billable ? "Yes" : "No",
  }));

  const csv = toCsv(rows);
  return csvResponse(
    csv,
    `timesheet-${from.toISOString().slice(0, 10)}-${to.toISOString().slice(0, 10)}.csv`
  );
}
