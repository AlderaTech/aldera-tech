"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";
import { ADMIN_ROUTES } from "@/lib/routes";
import { manualTimeEntrySchema } from "@/lib/validations/time-entry";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

export async function addManualEntryAction(
  projectId: string,
  formData: FormData
) {
  const user = await requireStaff();
  const parsed = manualTimeEntrySchema.safeParse({
    description: formData.get("description"),
    minutes: formData.get("minutes"),
    billable: formData.get("billable") !== "false",
  });
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Periksa durasi dan deskripsi.",
    };
  const { description, minutes, billable } = parsed.data;
  const durationSec = Math.floor(minutes * 60);
  const now = new Date();
  const startedAt = new Date(now.getTime() - durationSec * 1000);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.timeEntry.create({
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

      await tx.activityLog.create({
        data: {
          projectId,
          userId: user.id,
          action: "TIME_LOGGED",
          description: `Waktu tercatat: ${minutes} menit (${description}).`,
        },
      });
    });
  } catch {
    console.error("Pencatatan waktu gagal; transaksi dibatalkan.");
    return { ok: false, error: "Waktu belum tersimpan. Silakan coba kembali." };
  }

  revalidatePath(ADMIN_ROUTES.projectDetail(projectId));
  return { ok: true };
}

export async function deleteTimeEntryAction(entryId: string) {
  const user = await requireStaff();
  const entry = await prisma.timeEntry.findUnique({
    where: { id: entryId },
    select: { userId: true, projectId: true },
  });
  if (!entry) return;
  if (entry.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  await prisma.timeEntry.delete({ where: { id: entryId } });
  revalidatePath(ADMIN_ROUTES.projectDetail(entry.projectId));
}
