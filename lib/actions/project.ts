"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  projectCreateSchema,
  projectUpdateSchema,
} from "@/lib/validations/project";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { notify } from "@/lib/notifications";
import { waTemplates } from "@/lib/whatsapp-templates";
import {
  logProjectActivity,
  recomputeProgressIfAuto,
  requireStaffUser,
} from "./project-helpers";

export type ProjectActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  projectId?: string;
};

export async function createProjectAction(
  _: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const user = await requireStaffUser();
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

  await logProjectActivity(
    project.id,
    user.id,
    "PROJECT_CREATED",
    `Proyek "${data.title}" dibuat.`
  );

  revalidatePath(ADMIN_ROUTES.projects);
  revalidatePath(ADMIN_ROUTES.home);
  revalidatePath(DASHBOARD_ROUTES.home);
  revalidatePath(DASHBOARD_ROUTES.projects);

  return {
    ok: true,
    projectId: project.id,
    message: "Proyek berhasil dibuat.",
  };
}

export async function updateProjectAction(
  projectId: string,
  _: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const user = await requireStaffUser();
  const parsed = projectUpdateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    progress: formData.get("progress"),
    autoProgress:
      formData.get("autoProgress") === "true" ||
      formData.get("autoProgress") === "on",
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
        parsed.data.status === "COMPLETED"
          ? new Date()
          : before?.status === "COMPLETED"
            ? null
            : undefined,
    },
  });

  // If auto-progress is enabled, recompute from milestones now.
  if (parsed.data.autoProgress) {
    await recomputeProgressIfAuto(projectId);
  }

  if (before && before.status !== updated.status) {
    await logProjectActivity(
      projectId,
      user.id,
      "PROJECT_STATUS_CHANGED",
      `Status berubah dari ${before.status} ke ${updated.status}.`
    );
    // Notify client via WhatsApp
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { clientId: true, title: true },
    });
    if (project) {
      const tpl = waTemplates.projectStatusChanged(
        project.title,
        updated.status
      );
      notify({
        userId: project.clientId,
        type: "PROJECT_STATUS_CHANGED",
        ...tpl,
      }).catch(() => {});
    }
  }
  if (before && before.progress !== updated.progress) {
    await logProjectActivity(
      projectId,
      user.id,
      "PROGRESS_UPDATED",
      `Progres diperbarui ke ${updated.progress}%.`
    );
  }

  revalidatePath(ADMIN_ROUTES.projects);
  revalidatePath(ADMIN_ROUTES.projectDetail(projectId));
  revalidatePath(DASHBOARD_ROUTES.home);
  revalidatePath(DASHBOARD_ROUTES.projects);
  revalidatePath(DASHBOARD_ROUTES.projectDetail(projectId));

  return { ok: true, projectId, message: "Proyek diperbarui." };
}

export async function deleteProjectAction(projectId: string) {
  await requireStaffUser();
  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath(ADMIN_ROUTES.projects);
  revalidatePath(ADMIN_ROUTES.home);
  redirect(ADMIN_ROUTES.projects);
}

// -------- Activity log note --------
export async function addActivityNoteAction(
  projectId: string,
  formData: FormData
) {
  const user = await requireStaffUser();
  const note = String(formData.get("note") ?? "").trim();
  if (note.length < 2) return { ok: false };
  await logProjectActivity(projectId, user.id, "NOTE_ADDED", note);
  revalidatePath(ADMIN_ROUTES.projectDetail(projectId));
  revalidatePath(DASHBOARD_ROUTES.projectDetail(projectId));
  return { ok: true };
}
