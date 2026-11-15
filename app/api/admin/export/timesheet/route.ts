import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { csvResponse, toCsv } from "@/lib/csv";
import { isStaff } from "@/lib/permissions";
import {
  exportRangeSchema,
  resolveExportRange,
} from "@/lib/validations/export-range";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.roles ?? session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const parsed = exportRangeSchema.safeParse({
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
  });
  if (!parsed.success)
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "Rentang tanggal tidak valid.",
      },
      { status: 400 }
    );
  const range = resolveExportRange(parsed.data, new Date());
  if (!range)
    return NextResponse.json(
      { error: "Tanggal mulai harus sebelum atau sama dengan tanggal akhir." },
      { status: 400 }
    );
  const { from, to } = range;

  try {
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
  } catch (error) {
    console.error("Timesheet export failed:", error);
    return NextResponse.json(
      { error: "Ekspor timesheet belum tersedia. Silakan coba kembali." },
      { status: 503 }
    );
  }
}
