"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DASHBOARD_ROUTES } from "@/lib/routes";

export async function updateProfile(fd: FormData) {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "Unauthorized" };

  const name = (fd.get("name") as string)?.trim();
  if (!name) return { ok: false, message: "Nama wajib diisi" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone: (fd.get("phone") as string)?.trim() || null,
      company: (fd.get("company") as string)?.trim() || null,
    },
  });

  revalidatePath(DASHBOARD_ROUTES.profile);
  return { ok: true };
}
