"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";

async function getAuthContext(projectId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { clientId: true },
  });
  if (!project) throw new Error("Not found");
  const staff = isStaff(session.user.role);
  const owner = project.clientId === session.user.id;
  if (!staff && !owner) throw new Error("Forbidden");
  return { session, staff };
}

export async function postMessageAction(
  projectId: string,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const { session } = await getAuthContext(projectId);
  const content = String(formData.get("content") ?? "").trim();
  const parentId =
    (formData.get("parentId") as string | null) || null;
  if (content.length < 1 || content.length > 5000) {
    return { ok: false, error: "Pesan harus 1-5000 karakter." };
  }
  await prisma.projectMessage.create({
    data: {
      projectId,
      authorId: session.user.id,
      content,
      parentId,
    },
  });
  await prisma.activityLog.create({
    data: {
      projectId,
      userId: session.user.id,
      action: "MESSAGE_POSTED",
      description: `Pesan baru${parentId ? " (balasan)" : ""}.`,
    },
  });
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: true };
}

export async function editMessageAction(messageId: string, content: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const msg = await prisma.projectMessage.findUnique({
    where: { id: messageId },
    select: { authorId: true, projectId: true, deletedAt: true },
  });
  if (!msg || msg.deletedAt) throw new Error("Not found");
  if (msg.authorId !== session.user.id && !isStaff(session.user.role)) {
    throw new Error("Forbidden");
  }
  const trimmed = content.trim();
  if (trimmed.length < 1 || trimmed.length > 5000) throw new Error("Invalid length");
  await prisma.projectMessage.update({
    where: { id: messageId },
    data: { content: trimmed, editedAt: new Date() },
  });
  revalidatePath(`/admin/projects/${msg.projectId}`);
  revalidatePath(`/dashboard/projects/${msg.projectId}`);
}

export async function deleteMessageAction(messageId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const msg = await prisma.projectMessage.findUnique({
    where: { id: messageId },
    select: { authorId: true, projectId: true },
  });
  if (!msg) return;
  if (msg.authorId !== session.user.id && !isStaff(session.user.role)) {
    throw new Error("Forbidden");
  }
  // Soft delete to preserve thread continuity
  await prisma.projectMessage.update({
    where: { id: messageId },
    data: { deletedAt: new Date(), content: "[pesan dihapus]" },
  });
  revalidatePath(`/admin/projects/${msg.projectId}`);
  revalidatePath(`/dashboard/projects/${msg.projectId}`);
}
