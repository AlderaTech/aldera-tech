"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { lockAccountKey } from "@/lib/account-locks";
import {
  issueVerificationCode,
  consumeVerificationCode,
} from "@/lib/verification-store";
import type { Role } from "@prisma/client";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  loginSchema,
  registerSchema,
  resendOtpSchema,
} from "@/lib/validations/auth";
import { getPrimaryRole } from "@/lib/permissions";
import { deliverVerificationOtp } from "@/lib/otp-delivery";

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
    return {
      ok: false,
      success: false,
      message: "Periksa kembali input Anda.",
      errors,
    };
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
        return {
          ok: false,
          success: false,
          message: "Email atau password salah.",
        };
      }
      return {
        ok: false,
        success: false,
        message: "Terjadi kesalahan saat masuk.",
      };
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
      confirmPassword:
        payload.get("confirmPassword") ?? payload.get("password"),
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
  const createdUser = await prisma.$transaction(async (tx) => {
    await lockAccountKey(tx, "email:" + email.toLowerCase());
    await lockAccountKey(tx, "phone:" + normalizedPhone);
    if (await tx.user.findUnique({ where: { email }, select: { id: true } }))
      return null;
    const duplicate = await tx.user.findFirst({
      where: { phone: { in: [phone, normalizedPhone] } },
      select: { id: true },
    });
    if (duplicate) return null;
    return tx.user.create({
      data: {
        email,
        name,
        password: hashed,
        roles: ["CLIENT"],
        phone: normalizedPhone,
        phoneVerified: null,
      },
      select: { id: true },
    });
  });
  if (!createdUser)
    return {
      ok: false,
      success: false,
      message: "Email atau nomor WhatsApp sudah terdaftar.",
      errors: { email: "Periksa email atau nomor WhatsApp Anda." },
    };
  const issued = await issueVerificationCode(normalizedPhone, createdUser.id);
  if (!issued.ok)
    return {
      ...issued,
      success: false,
      requiresVerification: true,
      phone: normalizedPhone,
      email,
    };
  const otp = issued.code;
  if (!(await deliverVerificationOtp(phone, normalizedPhone, otp))) {
    return {
      ok: false,
      success: false,
      requiresVerification: true,
      phone: normalizedPhone,
      email,
      message:
        "Akun berhasil dibuat, tetapi kode OTP belum berhasil dikirim. Silakan kirim ulang kode di halaman verifikasi.",
    };
  }

  return {
    ok: true,
    success: true,
    requiresVerification: true,
    phone: normalizedPhone,
    email,
    message:
      "Registrasi berhasil. Kode OTP verifikasi telah dikirim via WhatsApp.",
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
    identifier = String(obj.identifier || obj.phone || obj.email || "").trim();
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

  const result = await consumeVerificationCode(identifier, token);
  if (result.ok && password) {
    try {
      await signIn("credentials", {
        email: result.email,
        password,
        redirect: false,
      });
    } catch {
      return {
        ...result,
        message:
          "Nomor terverifikasi. Silakan masuk menggunakan email dan password Anda.",
      };
    }
  }
  return result;
}

export async function resendOtpAction(
  arg1?: unknown,
  arg2?: unknown
): Promise<ActionState> {
  const payload = arg2 !== undefined ? arg2 : arg1;
  let phone = "";

  if (payload instanceof FormData) {
    phone = String(
      payload.get("phone") || payload.get("identifier") || ""
    ).trim();
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

  const parsedPhone = resendOtpSchema.safeParse({ phone });
  if (!parsedPhone.success)
    return {
      ok: false,
      success: false,
      message: "Nomor WhatsApp tidak valid.",
    };
  const normalizedPhone = internalNormalizePhone(parsedPhone.data.phone);
  const user = await prisma.user.findFirst({
    where: { isActive: true, phone: { in: [phone, normalizedPhone] } },
    select: { id: true },
  });
  if (!user)
    return {
      ok: false,
      success: false,
      message: "Nomor WhatsApp belum dapat diverifikasi.",
    };
  const issued = await issueVerificationCode(normalizedPhone, user.id);
  if (!issued.ok) return { ...issued, success: false };
  if (!(await deliverVerificationOtp(phone, normalizedPhone, issued.code)))
    return {
      ok: false,
      success: false,
      phone: normalizedPhone,
      message:
        "Kode OTP belum berhasil dikirim. Silakan coba lagi beberapa saat.",
    };
  return {
    ok: true,
    success: true,
    phone: normalizedPhone,
    cooldownSeconds: 60,
    message: "Kode OTP baru telah berhasil dikirim ke nomor WhatsApp Anda.",
  };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
