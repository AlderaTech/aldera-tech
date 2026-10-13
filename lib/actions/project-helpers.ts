import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";
import type { ActivityAction } from "@prisma/client";

export async function requireStaffUser() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

export async function logProjectActivity(
  projectId: string,
  userId: string,
  action: ActivityAction,
  description: string
) {
  await prisma.activityLog.create({
    data: { projectId, userId, action, description },
  });
}

/**
 * Recompute a project's progress from its milestones when autoProgress is enabled.
 * Safe no-op if autoProgress is off.
 */
export async function recomputeProgressIfAuto(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { autoProgress: true, progress: true },
  });
  if (!project || !project.autoProgress) return;
  const grouped = await prisma.milestone.groupBy({
    by: ["status"],
    where: { projectId },
    _count: { _all: true },
  });
  const total = grouped.reduce((sum, g) => sum + g._count._all, 0);
  if (total === 0) {
    await prisma.project.update({
      where: { id: projectId },
      data: { progress: 0 },
    });
    return;
  }
  const completed =
    grouped.find((g) => g.status === "COMPLETED")?._count._all ?? 0;
  const inProgress =
    grouped.find((g) => g.status === "IN_PROGRESS")?._count._all ?? 0;
  // Completed counts as 1, in-progress counts as 0.5.
  const percent = Math.round(((completed + inProgress * 0.5) / total) * 100);
  if (percent !== project.progress) {
    await prisma.project.update({
      where: { id: projectId },
      data: { progress: percent },
    });
  }
}
