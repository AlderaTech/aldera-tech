import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ROLE_LABELS, STAFF_ROLES } from "@/lib/permissions";

const WEEKLY_CAPACITY_HOURS = 40;

export default async function TeamWorkloadPage() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const data = await safeDb(async () => {
    const staff = await prisma.user.findMany({
      where: { role: { in: [...STAFF_ROLES] }, isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        assignedTasks: {
          where: { status: { notIn: ["DONE"] } },
          select: { id: true, priority: true },
        },
        projectAssignments: {
          select: { project: { select: { id: true, status: true } } },
        },
        timeEntries: {
          where: { startedAt: { gte: weekAgo } },
          select: { durationSec: true },
        },
      },
    });

    return staff.map((u) => {
      const hoursThisWeek = +(u.timeEntries.reduce((s, e) => s + e.durationSec, 0) / 3600).toFixed(1);
      const activeProjects = u.projectAssignments.filter(
        (a) => a.project.status === "IN_PROGRESS" || a.project.status === "REVIEW"
      ).length;
      const urgentTasks = u.assignedTasks.filter((t) => t.priority === "URGENT" || t.priority === "HIGH").length;

      return {
        id: u.id,
        name: u.name,
        role: u.role,
        activeTasks: u.assignedTasks.length,
        urgentTasks,
        activeProjects,
        hoursThisWeek,
        capacityPct: Math.min(100, Math.round((hoursThisWeek / WEEKLY_CAPACITY_HOURS) * 100)),
      };
    }).sort((a, b) => b.capacityPct - a.capacityPct);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tim & Workload</h1>
        <p className="text-muted-foreground text-sm">Beban kerja tim minggu ini (target {WEEKLY_CAPACITY_HOURS}h/minggu)</p>
      </div>

      {data.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">Belum ada anggota tim.</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((member) => (
            <Card key={member.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{member.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{ROLE_LABELS[member.role] ?? member.role}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Kapasitas</span>
                    <span className="font-medium">{member.hoursThisWeek}h / {WEEKLY_CAPACITY_HOURS}h</span>
                  </div>
                  <Progress
                    value={member.capacityPct}
                    className={`h-2 ${member.capacityPct > 90 ? "[&>div]:bg-destructive" : member.capacityPct > 70 ? "[&>div]:bg-amber-500" : ""}`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold">{member.activeTasks}</p>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{member.activeProjects}</p>
                    <p className="text-xs text-muted-foreground">Proyek</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-destructive">{member.urgentTasks}</p>
                    <p className="text-xs text-muted-foreground">Urgent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
