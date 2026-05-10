"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { waTemplates } from "@/lib/whatsapp-templates";
import { DASHBOARD_ROUTES } from "@/lib/routes";

export async function approveMilestoneAction(milestoneId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: { select: { id: true, clientId: true, title: true } } },
  });

  if (!milestone) throw new Error("Milestone not found");
  if (milestone.project.clientId !== session.user.id) throw new Error("Forbidden");
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

export async function rejectMilestoneAction(milestoneId: string, feedback: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: {
        select: { id: true, clientId: true, title: true, assignments: { select: { userId: true } } },
      },
    },
  });

  if (!milestone) throw new Error("Milestone not found");
  if (milestone.project.clientId !== session.user.id) throw new Error("Forbidden");
  if (!milestone.requiresClientApproval || milestone.clientApprovedAt) {
    throw new Error("Not awaiting approval");
  }

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { clientRejectedAt: new Date(), clientFeedback: feedback || null },
  });

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
  const tpl = waTemplates.milestoneReadyForApproval(
    milestone.project.title,
    milestone.title,
    milestone.project.id
  );
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
