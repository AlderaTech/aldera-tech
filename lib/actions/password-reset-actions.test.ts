import { describe, it, expect, mock, beforeEach } from "bun:test";
import bcrypt from "bcryptjs";

const mockSendWhatsApp = mock();

mock.module("server-only", () => ({}));

mock.module("@/lib/whatsapp", () => ({
  sendWhatsApp: mockSendWhatsApp,
}));

import { getTestPrisma } from "@/lib/test-prisma";
const prisma = getTestPrisma();
mock.module("@/lib/prisma", () => ({
  prisma,
  default: prisma,
}));

const { requestPasswordResetAction, resetPasswordAction } = await import(
  "@/lib/actions/password-reset"
);

describe("AT-L5: lib/actions/password-reset.ts test suite", () => {
  beforeEach(() => {
    mockSendWhatsApp.mockReset();
  });

  describe("requestPasswordResetAction", () => {
    it("rejects invalid email format", async () => {
      const formData = new FormData();
      formData.set("email", "not-a-valid-email");

      const res = await requestPasswordResetAction({ ok: false }, formData);
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Email tidak valid.");
    });

    it("returns generic success message for non-existent or inactive user (enumeration defense)", async () => {
      const formData = new FormData();
      formData.set("email", "ghost_user_nonexistent@aldera.test");

      const res = await requestPasswordResetAction({ ok: false }, formData);
      expect(res.ok).toBe(true);
      expect(res.message).toContain("Jika akun dan nomor WhatsApp terdaftar");
      expect(mockSendWhatsApp).not.toHaveBeenCalled();
    });

    it("generates token and sends WhatsApp link for active user with phone", async () => {
      const stamp = Date.now();
      const email = `reset_user_${stamp}@aldera.test`;
      const phone = `62813${stamp.toString().slice(-7)}`;

      const user = await prisma.user.create({
        data: {
          email,
          name: "Reset User",
          password: "hashed_dummy_password",
          phone,
          isActive: true,
          roles: ["CLIENT"],
        },
      });

      mockSendWhatsApp.mockResolvedValueOnce({ success: true });

      const formData = new FormData();
      formData.set("email", email);

      const res = await requestPasswordResetAction({ ok: false }, formData);
      expect(res.ok).toBe(true);

      // Verify token in DB
      const tokenRecord = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      expect(tokenRecord).not.toBeNull();
      expect(tokenRecord?.token).toBeDefined();
      expect(tokenRecord?.usedAt).toBeNull();
      expect(tokenRecord?.expiresAt.getTime()).toBeGreaterThan(Date.now());

      // Verify WhatsApp called
      expect(mockSendWhatsApp).toHaveBeenCalled();
      const waArgs = mockSendWhatsApp.mock.calls[0][0];
      expect(waArgs.to).toBe(phone);
      expect(waArgs.message).toContain(tokenRecord!.token);
    });
  });

  describe("resetPasswordAction", () => {
    it("rejects mismatched passwords or weak password schema", async () => {
      const formData = new FormData();
      formData.set("token", "dummy_token");
      formData.set("password", "Password123!");
      formData.set("confirmPassword", "DifferentPassword123!");

      const res = await resetPasswordAction({ ok: false }, formData);
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Periksa input Anda.");
    });

    it("rejects non-existent token", async () => {
      const formData = new FormData();
      formData.set("token", "totally_bogus_token_12345");
      formData.set("password", "NewPassword123!");
      formData.set("confirmPassword", "NewPassword123!");

      const res = await resetPasswordAction({ ok: false }, formData);
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Link tidak valid atau sudah kadaluarsa.");
    });

    it("rejects expired token", async () => {
      const stamp = Date.now();
      const user = await prisma.user.create({
        data: {
          email: `expired_user_${stamp}@aldera.test`,
          name: "Expired Token User",
          password: "old_hashed_password",
          isActive: true,
          roles: ["CLIENT"],
        },
      });

      const token = `expired_token_${stamp}`;
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt: new Date(Date.now() - 3600 * 1000), // 1 hour ago
        },
      });

      const formData = new FormData();
      formData.set("token", token);
      formData.set("password", "NewPassword123!");
      formData.set("confirmPassword", "NewPassword123!");

      const res = await resetPasswordAction({ ok: false }, formData);
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Link tidak valid atau sudah kadaluarsa.");
    });

    it("resets password successfully and prevents token re-use (single-use defense)", async () => {
      const stamp = Date.now();
      const user = await prisma.user.create({
        data: {
          email: `valid_reset_${stamp}@aldera.test`,
          name: "Valid Reset User",
          password: await bcrypt.hash("OldPassword123!", 10),
          isActive: true,
          roles: ["CLIENT"],
        },
      });

      const token = `valid_token_${stamp}`;
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7200 * 1000),
        },
      });

      const formData = new FormData();
      formData.set("token", token);
      formData.set("password", "BrandNewPassword123!");
      formData.set("confirmPassword", "BrandNewPassword123!");

      // First use: success
      const res = await resetPasswordAction({ ok: false }, formData);
      expect(res.ok).toBe(true);
      expect(res.message).toBe("Password berhasil diperbarui.");

      // Verify user's new hashed password
      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      const passwordMatches = await bcrypt.compare(
        "BrandNewPassword123!",
        updatedUser!.password!
      );
      expect(passwordMatches).toBe(true);

      // Verify token marked usedAt
      const updatedToken = await prisma.passwordResetToken.findUnique({
        where: { token },
      });
      expect(updatedToken?.usedAt).not.toBeNull();

      // Second use attempt: must be rejected
      const resReplay = await resetPasswordAction({ ok: false }, formData);
      expect(resReplay.ok).toBe(false);
      expect(resReplay.message).toBe("Link tidak valid atau sudah kadaluarsa.");
    });
  });
});
