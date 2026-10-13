"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { getPrimaryRole } from "@/lib/permissions";

export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  role?: Role;
  roles?: Role[];
};

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
    return { ok: false, message: "Periksa kembali input Anda.", errors };
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
      message: "Berhasil masuk.",
      role: primaryRole,
      roles: user?.roles,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { ok: false, message: "Email atau password salah." };
      }
      return { ok: false, message: "Terjadi kesalahan saat masuk." };
    }
    // Re-throw non-auth errors (e.g. Next.js redirects)
    throw error;
  }
}

export async function registerAction(
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    company: formData.get("company") || undefined,
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, message: "Periksa kembali input Anda.", errors };
  }

  const { name, email, password, company, phone } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      message: "Email sudah terdaftar.",
      errors: { email: "Email sudah terdaftar" },
    };
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
      roles: ["CLIENT"],
      company: company || null,
      phone: phone || null,
    },
  });

  try {
    await signIn("credentials", { email, password, redirect: false });
    return { ok: true, message: "Akun berhasil dibuat." };
  } catch {
    return {
      ok: true,
      message: "Akun dibuat. Silakan login.",
    };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
