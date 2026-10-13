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

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
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
  const role = (formData.get("role") as Role) ?? "CLIENT";
  const company = (formData.get("company") as string | null) || null;

  if (!email || !name) {
    return { ok: false, message: "Nama dan email wajib diisi." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, message: "Email sudah terdaftar." };
  }

  const tempPassword = randomBytes(6).toString("base64").replace(/[+/=]/g, "") + "1A!";
  await prisma.user.create({
    data: {
      email,
      name,
      role,
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

export async function updateUserRoleAction(userId: string, role: Role) {
  const current = await requireAdmin();
  if (userId === current.id && role === "CLIENT") {
    throw new Error("Tidak bisa menurunkan role diri sendiri menjadi Client.");
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath(ADMIN_ROUTES.users);
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
