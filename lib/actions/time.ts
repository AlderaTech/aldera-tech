"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

export async function startTimerAction(projectId: string, description: string) {
  const user = await requireStaff();
  // Stop any currently-running entry for this user
  const running = await prisma.timeEntry.findFirst({
    where: { userId: user.id, endedAt: null },
    select: { id: true, startedAt: true },
  });
  if (running) {
    const now = new Date();
    const durationSec = Math.floor(
      (now.getTime() - running.startedAt.getTime()) / 1000
    );
    await prisma.timeEntry.update({
      where: { id: running.id },
      data: { endedAt: now, durationSec },
    });
  }
  const entry = await prisma.timeEntry.create({
    data: {
      projectId,
      userId: user.id,
      description: description || "Tidak tersedia",
      startedAt: new Date(),
    },
    select: { id: true },
  });
  revalidatePath(`/admin/projects/${projectId}`);
  return { ok: true, id: entry.id };
}

export async function stopTimerAction(entryId: string) {
  const user = await requireStaff();
  const entry = await prisma.timeEntry.findUnique({
    where: { id: entryId },
    select: { userId: true, projectId: true, startedAt: true, endedAt: true },
  });
  if (!entry) return { ok: false };
  if (entry.userId !== user.id) throw new Error("Forbidden");
  if (entry.endedAt) return { ok: true };
  const now = new Date();
  const durationSec = Math.floor(
    (now.getTime() - entry.startedAt.getTime()) / 1000
  );
  await prisma.timeEntry.update({
    where: { id: entryId },
    data: { endedAt: now, durationSec },
  });
  await prisma.activityLog.create({
    data: {
      projectId: entry.projectId,
      userId: user.id,
      action: "TIME_LOGGED",
      description: `Waktu tercatat: ${Math.round(durationSec / 60)} menit.`,
    },
  });
  revalidatePath(`/admin/projects/${entry.projectId}`);
  return { ok: true };
}

export async function addManualEntryAction(
  projectId: string,
  formData: FormData
) {
  const user = await requireStaff();
  const description = String(formData.get("description") ?? "").trim();
  const minutes = Number(formData.get("minutes") ?? 0);
  const billable = formData.get("billable") !== "false";
  if (!description || minutes <= 0) {
    return { ok: false, error: "Deskripsi dan menit wajib" };
  }
  const durationSec = Math.floor(minutes * 60);
  const now = new Date();
  const startedAt = new Date(now.getTime() - durationSec * 1000);
  await prisma.timeEntry.create({
    data: {
      projectId,
      userId: user.id,
      description,
      startedAt,
      endedAt: now,
      durationSec,
      billable,
    },
  });
  revalidatePath(`/admin/projects/${projectId}`);
  return { ok: true };
}

export async function deleteTimeEntryAction(entryId: string) {
  const user = await requireStaff();
  const entry = await prisma.timeEntry.findUnique({
    where: { id: entryId },
    select: { userId: true, projectId: true },
  });
  if (!entry) return;
  if (entry.userId !== user.id && user.role !== "OWNER" && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  await prisma.timeEntry.delete({ where: { id: entryId } });
  revalidatePath(`/admin/projects/${entry.projectId}`);
}
