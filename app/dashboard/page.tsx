import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { OnboardingChecklist } from "./_components/onboarding-checklist";
import { OverviewWelcome } from "./_components/overview-welcome";
import { OverviewStats } from "./_components/overview-stats";
import { OverviewProjects } from "./_components/overview-projects";
import { OverviewActivity } from "./_components/overview-activity";
import styles from "./_components/overview.module.css";

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
    <div className={styles.columns}>
      <div className={styles.mainColumn}>
        <OverviewWelcome user={session!.user} />
        <OverviewStats
          active={stats.active}
          pending={stats.pending}
          spent={stats.spent}
        />
        <OnboardingChecklist />
        <OverviewProjects projects={stats.projects} />
      </div>
      <OverviewActivity recent={recent} />
    </div>
  );
}
