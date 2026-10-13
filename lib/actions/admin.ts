"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import type { Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { ADMIN_ROUTES } from "@/lib/routes";
import { isAdmin } from "@/lib/permissions";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.roles ?? session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

export async function inviteUserAction(
  formData: FormData
): Promise<{ ok: boolean; message: string; tempPassword?: string }> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const formRoles = formData.getAll("roles") as Role[];
  const singleRole = (formData.get("role") as Role) ?? "CLIENT";
  const roles: Role[] =
    formRoles.length > 0 ? formRoles : singleRole ? [singleRole] : ["CLIENT"];
  const company = (formData.get("company") as string | null) || null;

  if (!email || !name) {
    return { ok: false, message: "Nama dan email wajib diisi." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, message: "Email sudah terdaftar." };
  }

  const tempPassword =
    randomBytes(6).toString("base64").replace(/[+/=]/g, "") + "1A!";
  await prisma.user.create({
    data: {
      email,
      name,
      roles,
      company,
      password: await bcrypt.hash(tempPassword, 10),
    },
  });

  revalidatePath(ADMIN_ROUTES.users);

  return {
    ok: true,
    message: "User berhasil dibuat.",
    tempPassword,
  };
}

export async function updateUserRolesAction(userId: string, roles: Role[]) {
  const current = await requireAdmin();
  if (roles.length === 0) {
    throw new Error("User harus memiliki setidaknya satu role.");
  }
  if (userId === current.id && !roles.includes("ADMIN")) {
    throw new Error("Tidak bisa mencabut role Admin dari diri sendiri.");
  }
  await prisma.user.update({ where: { id: userId }, data: { roles } });
  revalidatePath(ADMIN_ROUTES.users);
}

export async function toggleUserRoleAction(userId: string, roleToToggle: Role) {
  const current = await requireAdmin();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true },
  });
  if (!user) throw new Error("User tidak ditemukan.");

  const hasRole = user.roles.includes(roleToToggle);
  let nextRoles: Role[];

  if (hasRole) {
    if (user.roles.length <= 1) {
      throw new Error("User harus memiliki setidaknya satu role.");
    }
    if (userId === current.id && roleToToggle === "ADMIN") {
      throw new Error("Tidak bisa mencabut role Admin dari diri sendiri.");
    }
    nextRoles = user.roles.filter((r) => r !== roleToToggle);
  } else {
    nextRoles = [...user.roles, roleToToggle];
  }

  await prisma.user.update({
    where: { id: userId },
    data: { roles: nextRoles },
  });
  revalidatePath(ADMIN_ROUTES.users);
}

export async function updateUserRoleAction(userId: string, role: Role) {
  return updateUserRolesAction(userId, [role]);
}

export async function toggleUserActiveAction(userId: string) {
  const current = await requireAdmin();
  if (userId === current.id) {
    throw new Error("Tidak bisa menonaktifkan diri sendiri.");
  }
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !u?.isActive },
  });
  revalidatePath(ADMIN_ROUTES.users);
}

export async function deleteFileAction(fileId: string) {
  await requireAdmin();
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    select: { path: true },
  });
  if (!file) return;
  try {
    await unlink(join(process.cwd(), "public", "uploads", file.path));
  } catch {
    // File might already be deleted on disk, continue.
  }
  await prisma.file.delete({ where: { id: fileId } });
  revalidatePath(ADMIN_ROUTES.files);
}
