"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  projectCreateSchema,
  projectUpdateSchema,
  milestoneSchema,
} from "@/lib/validations/project";
import type { ActivityAction, MilestoneStatus } from "@prisma/client";
import { isStaff } from "@/lib/permissions";

export type ProjectActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  projectId?: string;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

async function logActivity(
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
async function recomputeProgressIfAuto(projectId: string) {
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

export async function createProjectAction(
  _: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const user = await requireAdmin();
  const parsed = projectCreateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    clientId: formData.get("clientId"),
    deadline: formData.get("deadline") || undefined,
    budget: formData.get("budget") || undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, message: "Periksa input Anda.", errors };
  }

  const data = parsed.data;
  const project = await prisma.project.create({
    data: {
      title: data.title,
      description: data.description,
      clientId: data.clientId,
      deadline: data.deadline ? new Date(data.deadline) : null,
      budget: data.budget ? data.budget : null,
    },
    select: { id: true },
  });

  await logActivity(
    project.id,
    user.id,
    "PROJECT_CREATED",
    `Proyek "${data.title}" dibuat.`
  );

  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");

  return { ok: true, projectId: project.id, message: "Proyek berhasil dibuat." };
}

export async function updateProjectAction(
  projectId: string,
  _: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const user = await requireAdmin();
  const parsed = projectUpdateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    progress: formData.get("progress"),
    autoProgress: formData.get("autoProgress") === "true" || formData.get("autoProgress") === "on",
    deadline: formData.get("deadline") || undefined,
    budget: formData.get("budget") || undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, message: "Periksa input Anda.", errors };
  }

  const before = await prisma.project.findUnique({
    where: { id: projectId },
    select: { status: true, progress: true, autoProgress: true },
  });

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      // Only write manual progress when auto is off; auto path will recompute below.
      progress: parsed.data.autoProgress ? undefined : parsed.data.progress,
      autoProgress: parsed.data.autoProgress,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      budget: parsed.data.budget ? parsed.data.budget : null,
      completedAt:
        parsed.data.status === "COMPLETED" ? new Date() : before?.status === "COMPLETED" ? null : undefined,
    },
  });

  // If auto-progress is enabled, recompute from milestones now.
  if (parsed.data.autoProgress) {
    await recomputeProgressIfAuto(projectId);
  }

  if (before && before.status !== updated.status) {
    await logActivity(
      projectId,
      user.id,
      "PROJECT_STATUS_CHANGED",
      `Status berubah dari ${before.status} ke ${updated.status}.`
    );
  }
  if (before && before.progress !== updated.progress) {
    await logActivity(
      projectId,
      user.id,
      "PROGRESS_UPDATED",
      `Progres diperbarui ke ${updated.progress}%.`
    );
  }

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);

  return { ok: true, projectId, message: "Proyek diperbarui." };
}

export async function deleteProjectAction(projectId: string) {
  await requireAdmin();
  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  redirect("/admin/projects");
}

// -------- Milestones --------
export async function createMilestoneAction(projectId: string, formData: FormData) {
  const user = await requireAdmin();
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
  await logActivity(
    projectId,
    user.id,
    "MILESTONE_CREATED",
    `Milestone "${parsed.data.title}" ditambahkan.`
  );
  await recomputeProgressIfAuto(projectId);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: true };
}

export async function updateMilestoneStatusAction(
  milestoneId: string,
  status: MilestoneStatus
) {
  const user = await requireAdmin();
  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
    select: { projectId: true, title: true },
  });
  await logActivity(
    milestone.projectId,
    user.id,
    status === "COMPLETED" ? "MILESTONE_COMPLETED" : "MILESTONE_UPDATED",
    `Milestone "${milestone.title}" → ${status}.`
  );
  await recomputeProgressIfAuto(milestone.projectId);
  revalidatePath(`/admin/projects/${milestone.projectId}`);
  revalidatePath(`/dashboard/projects/${milestone.projectId}`);
}

export async function deleteMilestoneAction(milestoneId: string) {
  await requireAdmin();
  const m = await prisma.milestone.delete({
    where: { id: milestoneId },
    select: { projectId: true },
  });
  await recomputeProgressIfAuto(m.projectId);
  revalidatePath(`/admin/projects/${m.projectId}`);
  revalidatePath(`/dashboard/projects/${m.projectId}`);
}

// -------- Activity log note --------
export async function addActivityNoteAction(projectId: string, formData: FormData) {
  const user = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim();
  if (note.length < 2) return { ok: false };
  await logActivity(projectId, user.id, "NOTE_ADDED", note);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: true };
}
