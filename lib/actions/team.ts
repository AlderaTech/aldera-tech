"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit-log";
import type { ProjectAssignmentRole } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff, isOwnerOrAdmin } from "@/lib/permissions";
import { ADMIN_ROUTES } from "@/lib/routes";

async function requireOwnerOrAdmin() {
  const session = await auth();
  if (!session?.user || !isOwnerOrAdmin(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

export async function assignMemberAction(
  projectId: string,
  userId: string,
  role: ProjectAssignmentRole = "CONTRIBUTOR"
) {
  const current = await requireStaff();
  await prisma.projectAssignment.upsert({
    where: { projectId_userId: { projectId, userId } },
    update: { role },
    create: { projectId, userId, role },
  });
  await prisma.activityLog.create({
    data: {
      projectId,
      userId: current.id,
      action: "TEAM_MEMBER_ADDED",
      description: `Anggota tim di-assign dengan role ${role}.`,
    },
  });
  await logAudit(current.id, "PROJECT_ASSIGNMENT_ADDED", "Project", projectId, {
    assignedUserId: userId,
    role,
  });
  revalidatePath(ADMIN_ROUTES.projectDetail(projectId));
}

export async function removeMemberAction(projectId: string, userId: string) {
  const current = await requireStaff();
  await prisma.projectAssignment.deleteMany({
    where: { projectId, userId },
  });
  await prisma.activityLog.create({
    data: {
      projectId,
      userId: current.id,
      action: "TEAM_MEMBER_REMOVED",
      description: `Anggota tim dihapus dari proyek.`,
    },
  });
  await logAudit(
    current.id,
    "PROJECT_ASSIGNMENT_REMOVED",
    "Project",
    projectId,
    { removedUserId: userId }
  );
  revalidatePath(ADMIN_ROUTES.projectDetail(projectId));
}

export { requireOwnerOrAdmin, requireStaff };
