"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { profileUpdateSchema } from "@/lib/validations/profile";
import { lockAccountKey } from "@/lib/account-locks";
import { normalizePhone } from "@/lib/validations/auth";

export async function updateProfile(fd: FormData) {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "Unauthorized" };

  const parsed = profileUpdateSchema.safeParse({
    name: fd.get("name"),
    phone: fd.get("phone") ?? "",
  });
  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Data profil tidak valid.",
    };
  const result = await prisma.$transaction(async (tx) => {
    if (parsed.data.phone)
      await lockAccountKey(tx, `phone:${parsed.data.phone}`);
    const current = await tx.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    });
    if (!current) return { ok: false, message: "Akun tidak ditemukan." };
    if (parsed.data.phone) {
      const duplicate = await tx.user.findFirst({
        where: {
          id: { not: session.user.id },
          phone: {
            in: [
              parsed.data.phone,
              "0" + parsed.data.phone.slice(2),
              "+" + parsed.data.phone,
            ],
          },
        },
        select: { id: true },
      });
      if (duplicate)
        return {
          ok: false,
          message: "Nomor WhatsApp sudah digunakan akun lain.",
        };
    }
    const changed =
      (current.phone ? normalizePhone(current.phone) : null) !==
      parsed.data.phone;
    await tx.user.update({
      where: { id: session.user.id },
      data: { ...parsed.data, ...(changed ? { phoneVerified: null } : {}) },
    });
    return {
      ok: true,
      requiresPhoneVerification: changed && Boolean(parsed.data.phone),
      phone: parsed.data.phone,
      message:
        changed && parsed.data.phone
          ? "Profil disimpan. Verifikasi nomor WhatsApp baru sebelum memakainya untuk pemulihan akun."
          : "Profil berhasil disimpan.",
    };
  });

  revalidatePath(DASHBOARD_ROUTES.profile);
  return result;
}
