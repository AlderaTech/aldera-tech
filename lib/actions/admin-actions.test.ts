import { describe, it, expect, mock, beforeEach } from "bun:test";
import type { Role } from "@prisma/client";

type MockSession = {
  user: {
    id: string;
    roles?: Role[];
    role?: Role;
    name?: string;
    email?: string;
  };
} | null;

let currentSession: MockSession = null;

mock.module("@/auth", () => ({
  auth: mock(async () => currentSession),
  handlers: {},
  signIn: mock(),
  signOut: mock(),
}));

mock.module("next/cache", () => ({
  revalidatePath: mock(),
  revalidateTag: mock(),
}));

import { getTestPrisma } from "@/lib/test-prisma";
const prisma = getTestPrisma();
mock.module("@/lib/prisma", () => ({
  prisma,
  default: prisma,
}));

const {
  inviteUserAction,
  updateUserRolesAction,
  toggleUserRoleAction,
  toggleUserActiveAction,
} = await import("@/lib/actions/admin");

describe("AT-L2: lib/actions/admin.ts test suite", () => {
  const adminId = "admin_user_main_1";

  beforeEach(() => {
    currentSession = {
      user: {
        id: adminId,
        roles: ["ADMIN"],
        name: "Super Admin",
        email: "super.admin@aldera.test",
      },
    };
  });

  describe("Authorization Boundary (requireAdmin)", () => {
    it("throws Forbidden when session is null or role is non-admin", async () => {
      currentSession = null;
      const formData = new FormData();
      formData.set("email", "test@aldera.test");
      formData.set("name", "Test");

      expect(inviteUserAction(formData)).rejects.toThrow("Forbidden");

      currentSession = {
        user: {
          id: "client_1",
          roles: ["CLIENT"],
          name: "Client",
          email: "client@aldera.test",
        },
      };
      expect(inviteUserAction(formData)).rejects.toThrow("Forbidden");
    });
  });

  describe("inviteUserAction", () => {
    it("validates missing name or email", async () => {
      const formData = new FormData();
      formData.set("name", "");
      formData.set("email", "");

      const res = await inviteUserAction(formData);
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Nama dan email wajib diisi.");
    });

    it("rejects duplicate email", async () => {
      const stamp = Date.now();
      const existingEmail = `dup_${stamp}@aldera.test`;
      await prisma.user.create({
        data: {
          email: existingEmail,
          name: "Existing",
          password: "hashed_dummy_password",
          roles: ["CLIENT"],
        },
      });

      const formData = new FormData();
      formData.set("name", "Duplicate User");
      formData.set("email", existingEmail);

      const res = await inviteUserAction(formData);
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Email sudah terdaftar.");
    });

    it("creates user successfully and returns temporary password", async () => {
      const stamp = Date.now();
      const newEmail = `invitee_${stamp}@aldera.test`;
      const formData = new FormData();
      formData.set("name", "New Developer");
      formData.set("email", newEmail);
      formData.append("roles", "DEVELOPER");

      const res = await inviteUserAction(formData);
      expect(res.ok).toBe(true);
      expect(res.tempPassword).toBeDefined();

      const created = await prisma.user.findUnique({ where: { email: newEmail } });
      expect(created).not.toBeNull();
      expect(created?.roles).toEqual(["DEVELOPER"]);
    });
  });

  describe("updateUserRolesAction", () => {
    it("rejects empty roles array", async () => {
      expect(updateUserRolesAction("any_id", [])).rejects.toThrow(
        "User harus memiliki setidaknya satu role."
      );
    });

    it("prevents admin from removing ADMIN role from themselves (self-demotion)", async () => {
      expect(updateUserRolesAction(adminId, ["CLIENT"])).rejects.toThrow(
        "Tidak bisa mencabut role Admin dari diri sendiri."
      );
    });

    it("updates other user roles successfully", async () => {
      const stamp = Date.now();
      const targetUser = await prisma.user.create({
        data: {
          email: `target_${stamp}@aldera.test`,
          name: "Target User",
          password: "hashed_dummy_password",
          roles: ["CLIENT"],
        },
      });

      await updateUserRolesAction(targetUser.id, ["DEVELOPER"]);
      const updated = await prisma.user.findUnique({ where: { id: targetUser.id } });
      expect(updated?.roles).toEqual(["DEVELOPER"]);
    });
  });

  describe("toggleUserRoleAction", () => {
    it("adds role when not currently present", async () => {
      const stamp = Date.now();
      const user = await prisma.user.create({
        data: {
          email: `toggle_${stamp}@aldera.test`,
          name: "Toggle User",
          password: "hashed_dummy_password",
          roles: ["CLIENT"],
        },
      });

      await toggleUserRoleAction(user.id, "DEVELOPER");
      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated?.roles).toEqual(["CLIENT", "DEVELOPER"]);
    });

    it("prevents removing the last remaining role", async () => {
      const stamp = Date.now();
      const user = await prisma.user.create({
        data: {
          email: `single_role_${stamp}@aldera.test`,
          name: "Single Role",
          password: "hashed_dummy_password",
          roles: ["CLIENT"],
        },
      });

      expect(toggleUserRoleAction(user.id, "CLIENT")).rejects.toThrow(
        "User harus memiliki setidaknya satu role."
      );
    });

    it("prevents self-demotion from ADMIN role", async () => {
      const selfUser = await prisma.user.upsert({
        where: { id: adminId },
        create: {
          id: adminId,
          email: "super.admin@aldera.test",
          name: "Super Admin",
          password: "hashed_dummy_password",
          roles: ["ADMIN", "DEVELOPER"],
        },
        update: {
          roles: ["ADMIN", "DEVELOPER"],
        },
      });

      expect(toggleUserRoleAction(adminId, "ADMIN")).rejects.toThrow(
        "Tidak bisa mencabut role Admin dari diri sendiri."
      );
    });
  });

  describe("toggleUserActiveAction", () => {
    it("prevents self-deactivation", async () => {
      expect(toggleUserActiveAction(adminId)).rejects.toThrow(
        "Tidak bisa menonaktifkan diri sendiri."
      );
    });

    it("toggles active state on target user", async () => {
      const stamp = Date.now();
      const user = await prisma.user.create({
        data: {
          email: `active_${stamp}@aldera.test`,
          name: "Active Test",
          password: "hashed_dummy_password",
          roles: ["CLIENT"],
          isActive: true,
        },
      });

      await toggleUserActiveAction(user.id);
      let updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated?.isActive).toBe(false);

      await toggleUserActiveAction(user.id);
      updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated?.isActive).toBe(true);
    });
  });
});
