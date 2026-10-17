"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  loginSchema,
  registerSchema,
} from "@/lib/validations/auth";
import { getPrimaryRole } from "@/lib/permissions";
import { sendWhatsApp } from "@/lib/whatsapp";
import { waTemplates } from "@/lib/whatsapp-templates";

export type ActionState = {
  ok: boolean;
  success?: boolean;
  requiresVerification?: boolean;
  phone?: string;
  email?: string;
  message?: string;
  errors?: Record<string, string>;
  role?: Role;
  roles?: Role[];
  attempts?: number;
  remainingAttempts?: number;
  cooldownSeconds?: number;
  verified?: boolean;
  isLocked?: boolean;
};

function internalNormalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return phone.trim();
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return digits;
}

/**
 * Normalizes an Indonesian phone number to international 62xxx format.
 */
export async function normalizePhone(phone: string): Promise<string> {
  return internalNormalizePhone(phone);
}

export async function loginAction(
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, success: false, message: "Periksa kembali input Anda.", errors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    // Fetch the roles so the client can redirect to the right dashboard.
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { roles: true },
    });
    const primaryRole = getPrimaryRole(user?.roles);
    return {
      ok: true,
      success: true,
      message: "Berhasil masuk.",
      role: primaryRole,
      roles: user?.roles,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { ok: false, success: false, message: "Email atau password salah." };
      }
      return { ok: false, success: false, message: "Terjadi kesalahan saat masuk." };
    }
    // Re-throw non-auth errors (e.g. Next.js redirects)
    throw error;
  }
}

export async function registerAction(
  arg1?: unknown,
  arg2?: unknown
): Promise<ActionState> {
  const payload = arg2 !== undefined ? arg2 : arg1;
  let rawData: Record<string, unknown> = {};

  if (payload instanceof FormData) {
    rawData = {
      name: payload.get("name"),
      email: payload.get("email"),
      password: payload.get("password"),
      confirmPassword: payload.get("confirmPassword") ?? payload.get("password"),
      phone: payload.get("phone"),
    };
  } else if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    rawData = {
      name: obj.name,
      email: obj.email,
      password: obj.password,
      confirmPassword: obj.confirmPassword ?? obj.password,
      phone: obj.phone,
    };
  }

  const parsed = registerSchema.safeParse(rawData);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return {
      ok: false,
      success: false,
      message: "Periksa kembali input Anda.",
      errors,
    };
  }

  const { name, email, password, phone } = parsed.data;
  const normalizedPhone = internalNormalizePhone(phone);

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      success: false,
      message: "Email sudah terdaftar.",
      errors: { email: "Email sudah terdaftar" },
    };
  }

  const existingPhone = await prisma.user.findFirst({
    where: {
      OR: [{ phone }, { phone: normalizedPhone }],
    },
    select: { id: true },
  });
  if (existingPhone) {
    return {
      ok: false,
      success: false,
      message: "Nomor WhatsApp sudah terdaftar.",
      errors: { phone: "Nomor WhatsApp sudah terdaftar" },
    };
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
      roles: ["CLIENT"],
      phone: normalizedPhone,
      phoneVerified: null,
    },
  });

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  // Remove duplicate unverified tokens for this identifier to prevent unique constraint conflict
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: normalizedPhone,
      token: otp,
    },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: normalizedPhone,
      token: otp,
      type: "WHATSAPP_OTP",
      expiresAt,
      attempts: 0,
    },
  });

  const otpTpl = waTemplates.verificationOtp({ code: otp, ttlMinutes: 10 });
  await sendWhatsApp({
    to: phone,
    message: otpTpl.message,
  });

  return {
    ok: true,
    success: true,
    requiresVerification: true,
    phone: normalizedPhone,
    email,
    message: "Registrasi berhasil. Kode OTP verifikasi telah dikirim via WhatsApp.",
  };
}

export type VerifyOtpArgs = {
  identifier?: string;
  phone?: string;
  email?: string;
  token?: string;
  otp?: string;
  password?: string;
};

export async function verifyOtpAction(
  arg1?: unknown,
  arg2?: unknown
): Promise<ActionState> {
  const payload = arg2 !== undefined ? arg2 : arg1;
  let identifier = "";
  let token = "";
  let password: string | undefined = undefined;

  if (payload instanceof FormData) {
    identifier = String(
      payload.get("identifier") ||
        payload.get("phone") ||
        payload.get("email") ||
        ""
    ).trim();
    token = String(payload.get("token") || payload.get("otp") || "").trim();
    const p = payload.get("password");
    if (typeof p === "string" && p) password = p;
  } else if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    identifier = String(
      obj.identifier || obj.phone || obj.email || ""
    ).trim();
    token = String(obj.token || obj.otp || "").trim();
    if (typeof obj.password === "string" && obj.password) {
      password = obj.password;
    }
  }

  if (!identifier) {
    return {
      ok: false,
      success: false,
      message: "Nomor WhatsApp atau identifier tidak boleh kosong.",
      errors: { identifier: "Identifier wajib diisi." },
    };
  }

  if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
    return {
      ok: false,
      success: false,
      message: "Kode OTP harus berupa 6 digit angka.",
      errors: { token: "Kode OTP harus 6 digit angka." },
    };
  }

  const normalized = internalNormalizePhone(identifier);

  // Finds latest unverified token in prisma.verificationToken
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: {
      identifier: { in: [identifier, normalized] },
      type: "WHATSAPP_OTP",
      verifiedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!tokenRecord) {
    return {
      ok: false,
      success: false,
      message: "Kode OTP tidak valid atau belum diminta. Silakan minta kode baru.",
    };
  }

  // If attempts >= 5 or expired, reject.
  if (tokenRecord.attempts >= 5) {
    return {
      ok: false,
      success: false,
      attempts: tokenRecord.attempts,
      remainingAttempts: 0,
      isLocked: true,
      message: "Batas percobaan verifikasi telah habis (maksimal 5 kali). Silakan minta kode OTP baru.",
    };
  }

  if (new Date() > tokenRecord.expiresAt) {
    return {
      ok: false,
      success: false,
      attempts: tokenRecord.attempts,
      message: "Kode OTP telah kadaluarsa. Silakan minta kode baru.",
    };
  }

  // If token mismatch, increment attempts and reject.
  if (tokenRecord.token !== token) {
    const updatedAttempts = tokenRecord.attempts + 1;
    await prisma.verificationToken.update({
      where: { id: tokenRecord.id },
      data: { attempts: updatedAttempts },
    });
    const remainingAttempts = Math.max(0, 5 - updatedAttempts);
    return {
      ok: false,
      success: false,
      attempts: updatedAttempts,
      remainingAttempts,
      isLocked: updatedAttempts >= 5,
      message:
        remainingAttempts > 0
          ? `Kode OTP salah. Sisa percobaan: ${remainingAttempts}.`
          : "Batas percobaan verifikasi telah habis (maksimal 5 kali). Silakan minta kode OTP baru.",
    };
  }

  // On valid match: updates User.phoneVerified = new Date(), updates token verifiedAt = new Date().
  const now = new Date();
  await prisma.verificationToken.update({
    where: { id: tokenRecord.id },
    data: { verifiedAt: now },
  });

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: identifier },
        { phone: normalized },
        { email: identifier },
      ],
    },
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: now,
        ...(user.phone ? {} : { phone: normalized }),
      },
    });

    if (password) {
      try {
        await signIn("credentials", {
          email: user.email,
          password,
          redirect: false,
        });
      } catch {
        // Auto-login failure handled gracefully
      }
    }
  }

  const primaryRole = getPrimaryRole(user?.roles);

  return {
    ok: true,
    success: true,
    verified: true,
    phone: normalized,
    email: user?.email,
    role: primaryRole,
    roles: user?.roles,
    message: "Verifikasi nomor WhatsApp berhasil! Akun Anda telah aktif.",
  };
}

export async function resendOtpAction(
  arg1?: unknown,
  arg2?: unknown
): Promise<ActionState> {
  const payload = arg2 !== undefined ? arg2 : arg1;
  let phone = "";

  if (payload instanceof FormData) {
    phone = String(payload.get("phone") || payload.get("identifier") || "").trim();
  } else if (typeof payload === "string") {
    phone = payload.trim();
  } else if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    phone = String(obj.phone || obj.identifier || "").trim();
  }

  if (!phone) {
    return {
      ok: false,
      success: false,
      message: "Nomor WhatsApp wajib diisi.",
      errors: { phone: "Nomor WhatsApp wajib diisi." },
    };
  }

  const normalizedPhone = internalNormalizePhone(phone);

  // Rate limit check (60s cooldown from last token)
  const lastToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: { in: [phone, normalizedPhone] },
      type: "WHATSAPP_OTP",
    },
    orderBy: { createdAt: "desc" },
  });

  const COOLDOWN_SECONDS = 60;
  if (lastToken) {
    const elapsedSeconds = Math.floor(
      (Date.now() - lastToken.createdAt.getTime()) / 1000
    );
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const remainingSeconds = COOLDOWN_SECONDS - elapsedSeconds;
      return {
        ok: false,
        success: false,
        cooldownSeconds: remainingSeconds,
        message: `Silakan tunggu ${remainingSeconds} detik sebelum meminta kode OTP baru.`,
      };
    }
  }

  // Issues fresh 6-digit OTP, updates/creates token, calls sendWhatsApp.
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Ensure unique constraint [identifier, token] doesn't conflict
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: normalizedPhone,
      token: otp,
    },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: normalizedPhone,
      token: otp,
      type: "WHATSAPP_OTP",
      expiresAt,
      attempts: 0,
    },
  });

  const otpTpl = waTemplates.verificationOtp({ code: otp, ttlMinutes: 10 });
  await sendWhatsApp({
    to: phone,
    message: otpTpl.message,
  });

  return {
    ok: true,
    success: true,
    phone: normalizedPhone,
    cooldownSeconds: COOLDOWN_SECONDS,
    message: "Kode OTP baru telah berhasil dikirim ke nomor WhatsApp Anda.",
  };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
