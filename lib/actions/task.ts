"use server";

import { revalidatePath } from "next/cache";
import type { ActivityAction, TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/actions/team";
import { taskMutationSchema, taskReorderSchema } from "@/lib/validations/task";

export type TaskActionState = {
  ok: boolean;
  message?: string;
  taskId?: string;
};

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

function revalidateProject(projectId: string) {
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/admin/projects");
  revalidatePath("/dashboard/projects");
}

export async function createTaskAction(
  projectId: string,
  _: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const user = await requireStaff();
  const parsed = taskMutationSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || "",
    status: formData.get("status") || "BACKLOG",
    priority: formData.get("priority") || "MEDIUM",
    dueDate: formData.get("dueDate") || "",
    milestoneId:
      formData.get("milestoneId") === "none" ? "" : formData.get("milestoneId") || "",
    assigneeId:
      formData.get("assigneeId") === "none" ? "" : formData.get("assigneeId") || "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Input task tidak valid.",
    };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });
  if (!project) return { ok: false, message: "Project tidak ditemukan." };

  const count = await prisma.task.count({
    where: { projectId, status: parsed.data.status },
  });
  const task = await prisma.task.create({
    data: {
      projectId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      order: count,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      completedAt: parsed.data.status === "DONE" ? new Date() : null,
      milestoneId: parsed.data.milestoneId || null,
      assigneeId: parsed.data.assigneeId || null,
    },
    select: { id: true, title: true },
  });

  await logActivity(
    projectId,
    user.id,
    "TASK_CREATED",
    `Task "${task.title}" dibuat.`
  );
  revalidateProject(projectId);
  return { ok: true, taskId: task.id, message: "Task dibuat." };
}

export async function updateTaskAction(
  taskId: string,
  _: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const user = await requireStaff();
  const parsed = taskMutationSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || "",
    status: formData.get("status") || "BACKLOG",
    priority: formData.get("priority") || "MEDIUM",
    dueDate: formData.get("dueDate") || "",
    milestoneId:
      formData.get("milestoneId") === "none" ? "" : formData.get("milestoneId") || "",
    assigneeId:
      formData.get("assigneeId") === "none" ? "" : formData.get("assigneeId") || "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Input task tidak valid.",
    };
  }

  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      projectId: true,
      title: true,
      status: true,
      completedAt: true,
    },
  });
  if (!existing) return { ok: false, message: "Task tidak ditemukan." };

  const moved = existing.status !== parsed.data.status;
  const order = moved
    ? await prisma.task.count({
        where: { projectId: existing.projectId, status: parsed.data.status },
      })
    : undefined;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      order,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      completedAt:
        parsed.data.status === "DONE"
          ? existing.completedAt ?? new Date()
          : null,
      milestoneId: parsed.data.milestoneId || null,
      assigneeId: parsed.data.assigneeId || null,
    },
    select: { projectId: true, title: true, status: true },
  });

  if (moved) {
    await logActivity(
      updated.projectId,
      user.id,
      "TASK_STATUS_CHANGED",
      `Task "${updated.title}" berubah dari ${existing.status} ke ${updated.status}.`
    );
  }

  revalidateProject(updated.projectId);
  return { ok: true, taskId, message: "Task diperbarui." };
}

export async function deleteTaskAction(taskId: string) {
  await requireStaff();
  const task = await prisma.task.delete({
    where: { id: taskId },
    select: { projectId: true },
  });
  revalidateProject(task.projectId);
  return { ok: true };
}

export async function reorderProjectTasksAction(
  projectId: string,
  columns: Record<TaskStatus, string[]>
) {
  const user = await requireStaff();
  const parsed = taskReorderSchema.safeParse({ columns });
  if (!parsed.success) return { ok: false, message: "Urutan task tidak valid." };

  const ids = Object.values(parsed.data.columns).flat();
  const tasks = await prisma.task.findMany({
    where: { projectId, id: { in: ids } },
    select: { id: true, title: true, status: true, completedAt: true },
  });
  if (tasks.length !== ids.length) {
    return { ok: false, message: "Sebagian task tidak ditemukan." };
  }

  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const now = new Date();
  const updates = Object.entries(parsed.data.columns).flatMap(
    ([status, taskIds]) =>
      taskIds.map((id, order) => {
        const task = taskById.get(id);
        return prisma.task.update({
          where: { id },
          data: {
            status: status as TaskStatus,
            order,
            completedAt:
              status === "DONE" ? task?.completedAt ?? now : null,
          },
          select: { id: true },
        });
      })
  );

  const moved = tasks.filter((task) => {
    const nextStatus = Object.entries(parsed.data.columns).find(([, taskIds]) =>
      taskIds.includes(task.id)
    )?.[0];
    return nextStatus && nextStatus !== task.status;
  });

  await prisma.$transaction(updates);

  for (const task of moved) {
    const nextStatus = Object.entries(parsed.data.columns).find(([, taskIds]) =>
      taskIds.includes(task.id)
    )?.[0];
    await logActivity(
      projectId,
      user.id,
      "TASK_STATUS_CHANGED",
      `Task "${task.title}" berubah dari ${task.status} ke ${nextStatus}.`
    );
  }

  revalidateProject(projectId);
  return { ok: true };
}
