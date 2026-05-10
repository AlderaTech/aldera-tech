"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email";
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

function resetEmailHtml(args: { name: string; url: string }) {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f6f6f6;padding:24px;">
<div style="max-width:520px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;">
  <div style="background:#0ea5e9;color:white;padding:20px;">
    <h1 style="margin:0;font-size:20px;">Reset Password Solvo Tech</h1>
  </div>
  <div style="padding:24px;">
    <p>Halo <strong>${args.name}</strong>,</p>
    <p>Kami menerima permintaan untuk me-reset password akun Anda. Klik tombol di bawah dalam ${TOKEN_TTL_HOURS} jam ke depan untuk melanjutkan.</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${args.url}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Reset Password</a>
    </p>
    <p style="color:#666;font-size:13px;">Jika tombol tidak berfungsi, salin URL ini:<br/><span style="word-break:break-all;">${args.url}</span></p>
    <p style="color:#666;font-size:13px;">Jika Anda tidak meminta reset, abaikan email ini.</p>
  </div>
</div></body></html>`;
}

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
    select: { id: true, name: true, email: true, isActive: true },
  });

  // Always respond success to prevent email enumeration
  if (!user || !user.isActive) {
    return {
      ok: true,
      message: "Jika email terdaftar, link reset telah dikirim.",
    };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${appUrl}/reset-password?token=${token}`;

  try {
    await sendMail({
      to: user.email,
      subject: "Reset Password, Solvo Tech",
      html: resetEmailHtml({ name: user.name, url }),
    });
  } catch (err) {
    console.error("Password reset email error:", err);
    return {
      ok: false,
      message: "Gagal mengirim email. Coba lagi beberapa saat.",
    };
  }

  return {
    ok: true,
    message: "Jika email terdaftar, link reset telah dikirim.",
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

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.user.id },
      data: { password: await bcrypt.hash(parsed.data.password, 10) },
    }),
    prisma.passwordResetToken.update({
      where: { token: parsed.data.token },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true, message: "Password berhasil diperbarui." };
}
