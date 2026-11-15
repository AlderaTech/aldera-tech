import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { lockAccountKey } from "@/lib/account-locks";
import { normalizePhone } from "@/lib/validations/auth";
import { getPrimaryRole } from "@/lib/permissions";

/** Private persistence layer; codes are never exported by a Server Action. */
export async function issueVerificationCode(
  identifier: string,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    await lockAccountKey(tx, `otp:${identifier}`);
    const account = await tx.user.findUnique({
      where: { id: userId },
      select: { phone: true, isActive: true },
    });
    if (
      !account?.isActive ||
      !account.phone ||
      normalizePhone(account.phone) !== identifier
    )
      return {
        ok: false as const,
        message: "Nomor WhatsApp belum dapat diverifikasi.",
      };
    const last = await tx.verificationToken.findFirst({
      where: {
        identifier,
        type: "WHATSAPP_OTP",
        createdAt: { gt: new Date(Date.now() - 60000) },
      },
      orderBy: { createdAt: "desc" },
    });
    if (last) {
      const seconds = Math.max(
        1,
        60 - Math.floor((Date.now() - last.createdAt.getTime()) / 1000)
      );
      return {
        ok: false as const,
        cooldownSeconds: seconds,
        message: `Silakan tunggu ${seconds} detik sebelum meminta kode OTP baru.`,
      };
    }
    let code = randomInt(100000, 1000000).toString();
    while (
      await tx.verificationToken.findUnique({
        where: { identifier_token: { identifier, token: code } },
        select: { id: true },
      })
    )
      code = randomInt(100000, 1000000).toString();
    await tx.verificationToken.updateMany({
      where: { identifier, type: "WHATSAPP_OTP", verifiedAt: null },
      data: { verifiedAt: new Date() },
    });
    await tx.verificationToken.create({
      data: {
        identifier,
        token: code,
        subjectUserId: userId,
        type: "WHATSAPP_OTP",
        attempts: 0,
        expiresAt: new Date(Date.now() + 600000),
      },
    });
    return { ok: true as const, code };
  });
}

export async function consumeVerificationCode(
  identifier: string,
  code: string
) {
  const normalized = normalizePhone(identifier);
  return prisma.$transaction(async (tx) => {
    await lockAccountKey(tx, `otp:${normalized}`);
    const record = await tx.verificationToken.findFirst({
      where: {
        identifier: { in: [identifier, normalized] },
        type: "WHATSAPP_OTP",
        verifiedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
    if (!record)
      return {
        ok: false as const,
        success: false,
        message:
          "Kode OTP tidak valid atau belum diminta. Silakan minta kode baru.",
      };
    if (record.attempts >= 5)
      return {
        ok: false as const,
        success: false,
        isLocked: true,
        attempts: record.attempts,
        remainingAttempts: 0,
        message:
          "Batas percobaan verifikasi telah habis (maksimal 5 kali). Silakan minta kode OTP baru.",
      };
    if (record.expiresAt <= new Date())
      return {
        ok: false as const,
        success: false,
        attempts: record.attempts,
        message: "Kode OTP telah kadaluarsa. Silakan minta kode baru.",
      };
    if (record.token !== code) {
      await tx.verificationToken.updateMany({
        where: { id: record.id, attempts: { lt: 5 }, verifiedAt: null },
        data: { attempts: { increment: 1 } },
      });
      const attempts = record.attempts + 1;
      return {
        ok: false as const,
        success: false,
        attempts,
        remainingAttempts: Math.max(0, 5 - attempts),
        isLocked: attempts >= 5,
        message:
          attempts >= 5
            ? "Batas percobaan verifikasi telah habis (maksimal 5 kali). Silakan minta kode OTP baru."
            : `Kode OTP salah. Sisa percobaan: ${5 - attempts}.`,
      };
    }
    const users = await tx.user.findMany({
      where: {
        ...(record.subjectUserId ? { id: record.subjectUserId } : {}),
        isActive: true,
        phone: { in: [identifier, normalized] },
      },
      select: { id: true, email: true, roles: true },
      take: 2,
    });
    if (users.length !== 1)
      return {
        ok: false as const,
        success: false,
        message:
          "Akun untuk kode ini tidak ditemukan atau memerlukan pemeriksaan administrator.",
      };
    const user = users[0];
    const claimed = await tx.verificationToken.updateMany({
      where: {
        id: record.id,
        verifiedAt: null,
        attempts: { lt: 5 },
        expiresAt: { gt: new Date() },
      },
      data: { verifiedAt: new Date() },
    });
    if (!claimed.count)
      return {
        ok: false as const,
        success: false,
        message: "Kode OTP sudah dipakai atau tidak berlaku.",
      };
    const updated = await tx.user.updateMany({
      where: {
        id: user.id,
        isActive: true,
        phone: { in: [identifier, normalized] },
      },
      data: { phoneVerified: new Date(), phone: normalized },
    });
    if (!updated.count)
      return {
        ok: false as const,
        success: false,
        message: "Nomor akun telah berubah. Silakan minta kode baru.",
      };
    return {
      ok: true as const,
      success: true,
      verified: true,
      phone: normalized,
      email: user.email,
      role: getPrimaryRole(user.roles),
      roles: user.roles,
      message: "Verifikasi nomor WhatsApp berhasil! Akun Anda telah aktif.",
    };
  });
}
