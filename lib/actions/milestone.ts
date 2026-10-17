"use server";

import { revalidatePath } from "next/cache";
import type { MilestoneStatus } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { milestoneSchema } from "@/lib/validations/project";
import { waTemplates } from "@/lib/whatsapp-templates";
import {
  logProjectActivity,
  recomputeProgressIfAuto,
  requireStaffUser,
} from "./project-helpers";

export async function createMilestoneAction(
  projectId: string,
  formData: FormData
) {
  const user = await requireStaffUser();
  const parsed = milestoneSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") ?? "PENDING",
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) return { ok: false };

  const count = await prisma.milestone.count({ where: { projectId } });
  await prisma.milestone.create({
    data: {
      projectId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      order: count,
      completedAt: parsed.data.status === "COMPLETED" ? new Date() : null,
    },
  });
  await logProjectActivity(
    projectId,
    user.id,
    "MILESTONE_CREATED",
    `Milestone "${parsed.data.title}" ditambahkan.`
  );
  await recomputeProgressIfAuto(projectId);
  revalidatePath(ADMIN_ROUTES.projectDetail(projectId));
  revalidatePath(DASHBOARD_ROUTES.projectDetail(projectId));
  return { ok: true };
}

export async function updateMilestoneStatusAction(
  milestoneId: string,
  status: MilestoneStatus
) {
  const user = await requireStaffUser();
  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
      ...(status === "COMPLETED"
        ? { clientRejectedAt: null, clientFeedback: null }
        : {}),
    },
    select: { projectId: true, title: true, requiresClientApproval: true },
  });
  await logProjectActivity(
    milestone.projectId,
    user.id,
    status === "COMPLETED" ? "MILESTONE_COMPLETED" : "MILESTONE_UPDATED",
    `Milestone "${milestone.title}" → ${status}.`
  );
  await recomputeProgressIfAuto(milestone.projectId);

  // Notify client if milestone completed and requires approval
  if (status === "COMPLETED" && milestone.requiresClientApproval) {
    const project = await prisma.project.findUnique({
      where: { id: milestone.projectId },
      select: { clientId: true, title: true },
    });
    if (project) {
      const tpl = waTemplates.milestoneReadyForApproval(
        project.title,
        milestone.title,
        milestone.projectId
      );
      notify({
        userId: project.clientId,
        type: "MILESTONE_READY_FOR_APPROVAL",
        ...tpl,
      }).catch(() => {});
    }
  }

  revalidatePath(ADMIN_ROUTES.projectDetail(milestone.projectId));
  revalidatePath(DASHBOARD_ROUTES.projectDetail(milestone.projectId));
}

export async function deleteMilestoneAction(milestoneId: string) {
  await requireStaffUser();
  const m = await prisma.milestone.delete({
    where: { id: milestoneId },
    select: { projectId: true },
  });
  await recomputeProgressIfAuto(m.projectId);
  revalidatePath(ADMIN_ROUTES.projectDetail(m.projectId));
  revalidatePath(DASHBOARD_ROUTES.projectDetail(m.projectId));
}

export async function approveMilestoneAction(milestoneId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: { select: { id: true, clientId: true, title: true } } },
  });

  if (!milestone) throw new Error("Milestone not found");
  if (milestone.project.clientId !== session.user.id)
    throw new Error("Forbidden");
  if (!milestone.requiresClientApproval || milestone.clientApprovedAt) {
    throw new Error("Not awaiting approval");
  }

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { clientApprovedAt: new Date() },
  });

  await prisma.activityLog.create({
    data: {
      action: "MILESTONE_COMPLETED",
      description: `Client menyetujui milestone "${milestone.title}"`,
      projectId: milestone.project.id,
      userId: session.user.id,
    },
  });

  revalidatePath(DASHBOARD_ROUTES.projectDetail(milestone.project.id));
}

export async function rejectMilestoneAction(
  milestoneId: string,
  feedback: string
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: {
        select: {
          id: true,
          clientId: true,
          title: true,
          assignments: { select: { userId: true } },
        },
      },
    },
  });

  if (!milestone) throw new Error("Milestone not found");
  if (milestone.project.clientId !== session.user.id)
    throw new Error("Forbidden");
  if (!milestone.requiresClientApproval || milestone.clientApprovedAt) {
    throw new Error("Not awaiting approval");
  }

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: "IN_PROGRESS",
      completedAt: null,
      clientRejectedAt: new Date(),
      clientFeedback: feedback || null,
    },
  });

  await recomputeProgressIfAuto(milestone.project.id);

  await prisma.activityLog.create({
    data: {
      action: "MILESTONE_UPDATED",
      description: `Client menolak milestone "${milestone.title}"${feedback ? `: ${feedback}` : ""}`,
      projectId: milestone.project.id,
      userId: session.user.id,
    },
  });

  // Notify assigned team members
  const teamIds = milestone.project.assignments.map((a) => a.userId);
  for (const uid of teamIds) {
    await notify({
      userId: uid,
      type: "MILESTONE_REJECTED",
      title: "Milestone Ditolak",
      message: `Client menolak milestone "${milestone.title}" pada proyek "${milestone.project.title}".${feedback ? ` Feedback: ${feedback}` : ""}`,
    });
  }

  revalidatePath(DASHBOARD_ROUTES.projectDetail(milestone.project.id));
}
