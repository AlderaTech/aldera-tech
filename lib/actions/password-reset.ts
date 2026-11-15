"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { AUTH_ROUTES } from "@/lib/routes";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import { waTemplates } from "@/lib/whatsapp-templates";
import {
  requestResetSchema,
  resetPasswordSchema,
} from "@/lib/validations/password-reset";

export type ResetActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

const TOKEN_TTL_HOURS = 2;

export async function requestPasswordResetAction(
  _: ResetActionState,
  formData: FormData
): Promise<ResetActionState> {
  const parsed = requestResetSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Email tidak valid." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      phoneVerified: true,
      isActive: true,
    },
  });

  // Always respond success to prevent enumeration
  if (!user || !user.isActive || !user.phone || !user.phoneVerified) {
    return {
      ok: true,
      message:
        "Jika akun dan nomor WhatsApp terdaftar, tautan reset telah dikirim ke WhatsApp Anda.",
    };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${appUrl}${AUTH_ROUTES.resetPasswordWithToken(token)}`;

  try {
    const tpl = waTemplates.passwordReset({
      name: user.name,
      resetUrl: url,
      ttlHours: TOKEN_TTL_HOURS,
    });

    const res = await sendWhatsApp({
      to: user.phone,
      message: `*${tpl.title}*\n\n${tpl.message}`,
    });

    if (!res.success) {
      console.error("Password reset WhatsApp error:", res.error);
      return {
        ok: false,
        message: "Gagal mengirim pesan WhatsApp. Coba lagi beberapa saat.",
      };
    }
  } catch (err) {
    console.error("Password reset error:", err);
    return {
      ok: false,
      message: "Gagal mengirim pesan WhatsApp. Coba lagi beberapa saat.",
    };
  }

  return {
    ok: true,
    message:
      "Jika akun dan nomor WhatsApp terdaftar, tautan reset telah dikirim ke WhatsApp Anda.",
  };
}

export async function resetPasswordAction(
  _: ResetActionState,
  formData: FormData
): Promise<ResetActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, message: "Periksa input Anda.", errors };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
    include: { user: { select: { id: true, isActive: true } } },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return {
      ok: false,
      message: "Link tidak valid atau sudah kadaluarsa.",
    };
  }
  if (!record.user.isActive) {
    return { ok: false, message: "Akun tidak aktif." };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  const changed = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${record.user.id} FOR UPDATE`;
    const claimed = await tx.passwordResetToken.updateMany({
      where: {
        token: parsed.data.token,
        usedAt: null,
        expiresAt: { gt: new Date() },
        user: { isActive: true },
      },
      data: { usedAt: new Date() },
    });
    if (!claimed.count) return false;
    await tx.user.update({
      where: { id: record.user.id },
      data: { password: hashed, securityVersion: { increment: 1 } },
    });
    await tx.passwordResetToken.updateMany({
      where: { userId: record.user.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    return true;
  });
  if (!changed)
    return { ok: false, message: "Link tidak valid atau sudah kadaluarsa." };

  return { ok: true, message: "Password berhasil diperbarui." };
}
