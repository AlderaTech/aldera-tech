import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { csvResponse, toCsv } from "@/lib/csv";
import { isStaff } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const roles =
    session?.user?.roles ?? (session?.user?.role ? [session.user.role] : []);
  if (!session?.user || !isStaff(roles)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true, email: true } },
      _count: { select: { milestones: true, invoices: true } },
    },
  });

  const rows = projects.map((p) => ({
    title: p.title,
    status: p.status,
    progress: p.progress,
    autoProgress: p.autoProgress,
    clientName: p.client.name,
    clientEmail: p.client.email,
    budget: p.budget ? Number(p.budget).toFixed(2) : "",
    startDate: p.startDate.toISOString().slice(0, 10),
    deadline: p.deadline?.toISOString().slice(0, 10) ?? "",
    completedAt: p.completedAt?.toISOString().slice(0, 10) ?? "",
    milestoneCount: p._count.milestones,
    invoiceCount: p._count.invoices,
  }));

  const csv = toCsv(rows);
  const filename = `projects-${new Date().toISOString().slice(0, 10)}.csv`;
  return csvResponse(csv, filename);
}
