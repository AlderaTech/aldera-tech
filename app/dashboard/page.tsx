import Link from "next/link";
import { FolderKanban, Receipt, Wallet, Activity, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatDate } from "@/lib/utils";
import { projectStatusMeta } from "@/lib/status-meta";

export default async function DashboardHome() {
  const session = await auth();
  const userId = session!.user.id;

  const stats = await safeDb(
    async () => {
      const [active, pending, spent, projects] = await Promise.all([
        prisma.project.count({
          where: {
            clientId: userId,
            status: { in: ["IN_PROGRESS", "REVIEW"] },
          },
        }),
        prisma.invoice.count({
          where: {
            clientId: userId,
            status: { in: ["SENT", "OVERDUE"] },
          },
        }),
        prisma.invoice.aggregate({
          _sum: { total: true },
          where: { clientId: userId, status: "PAID" },
        }),
        prisma.project.findMany({
          where: { clientId: userId },
          orderBy: { updatedAt: "desc" },
          take: 3,
          include: {
            milestones: {
              where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
              orderBy: { dueDate: "asc" },
              take: 1,
            },
          },
        }),
      ]);
      return {
        active,
        pending,
        spent: Number(spent._sum.total ?? 0),
        projects,
      };
    },
    { active: 0, pending: 0, spent: 0, projects: [] }
  );

  const recent = await safeDb(
    async () =>
      await prisma.activityLog.findMany({
        where: { project: { clientId: userId } },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { project: { select: { title: true, id: true } } },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl xxxl:text-3xl font-bold tracking-tight">
          Halo, {session?.user?.name?.split(" ")[0] ?? "User"} 👋
        </h1>
        <p className="text-muted-foreground">
          Berikut ringkasan aktivitas proyek Anda.
        </p>
      </div>

      <OnboardingChecklist />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FolderKanban className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">Proyek Aktif</div>
            <div className="text-2xl font-bold mt-1">
              <AnimatedCounter value={stats.active} />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <Receipt className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">Invoice Pending</div>
            <div className="text-2xl font-bold mt-1">
              <AnimatedCounter value={stats.pending} />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <Wallet className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">Total Dibayarkan</div>
            <div className="text-2xl font-bold mt-1">
              <AnimatedCounter
                value={stats.spent}
                format="currency"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle>Proyek Terbaru</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/dashboard/projects">
                Semua <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.projects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada proyek aktif.
              </p>
            ) : (
              stats.projects.map((p) => {
                const meta = projectStatusMeta[p.status];
                const nextMilestone = p.milestones[0];
                return (
                  <Link
                    key={p.id}
                    href={`/dashboard/projects/${p.id}`}
                    className="block"
                  >
                    <div className="p-4 rounded-lg border hover:border-primary/50 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium truncate">{p.title}</h3>
                            <Badge variant={meta.variant} className="shrink-0">
                              {meta.label}
                            </Badge>
                          </div>
                          {nextMilestone && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Next: {nextMilestone.title}
                              {nextMilestone.dueDate &&
                                ` • ${formatDate(nextMilestone.dueDate)}`}
                            </p>
                          )}
                        </div>
                        <div className="tabular-nums text-sm text-muted-foreground">
                          {p.progress}%
                        </div>
                      </div>
                      <Progress value={p.progress} className="mt-3" />
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-4" />
              Aktivitas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada aktivitas.
              </p>
            ) : (
              recent.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="size-1.5 mt-2 rounded-full bg-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2">{a.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.project?.title} •{" "}
                      {formatDate(a.createdAt, {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
