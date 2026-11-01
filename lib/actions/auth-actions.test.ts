import { describe, it, expect, mock, beforeEach } from "bun:test";
import { AuthError } from "next-auth";

const mockSignIn = mock();
const mockSignOut = mock();
const mockSendWhatsApp = mock();

mock.module("@/auth", () => ({
  signIn: mockSignIn,
  signOut: mockSignOut,
  auth: mock(async () => null),
  handlers: {},
}));

mock.module("@/lib/whatsapp", () => ({
  sendWhatsApp: mockSendWhatsApp,
}));

import {
  normalizePhone,
  loginAction,
  registerAction,
  verifyOtpAction,
  resendOtpAction,
} from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";

describe("AT-L1: lib/actions/auth.ts test suite", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockSignOut.mockReset();
    mockSendWhatsApp.mockReset();
  });

  describe("Phone Normalization", () => {
    it("normalizes Indonesian phone numbers into 62 format", async () => {
      expect(await normalizePhone("08123456789")).toBe("628123456789");
      expect(await normalizePhone("628123456789")).toBe("628123456789");
      expect(await normalizePhone("+62 812-3456-789")).toBe("628123456789");
      expect(await normalizePhone("")).toBe("");
    });
  });

  describe("loginAction", () => {
    it("returns validation error for empty or invalid email/password", async () => {
      const formData = new FormData();
      formData.set("email", "not-an-email");
      formData.set("password", "");

      const res = await loginAction({ ok: false }, formData);
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Periksa kembali input Anda.");
      expect(res.errors?.email).toBeDefined();
    });

    it("logs in successfully and returns user roles", async () => {
      const testEmail = `login_user_${Date.now()}@aldera.test`;
      await prisma.user.create({
        data: {
          email: testEmail,
          name: "Login User",
          password: "hashed_dummy_password",
          roles: ["CLIENT"],
        },
      });

      mockSignIn.mockResolvedValueOnce(undefined);

      const formData = new FormData();
      formData.set("email", testEmail);
      formData.set("password", "Password123!");

      const res = await loginAction({ ok: false }, formData);
      expect(res.ok).toBe(true);
      expect(res.success).toBe(true);
      expect(res.role).toBe("CLIENT");
      expect(res.roles).toEqual(["CLIENT"]);
    });

    it("handles CredentialsSignin AuthError gracefully", async () => {
      class CredentialsError extends AuthError {
        constructor() {
          super();
          this.type = "CredentialsSignin";
        }
      }
      mockSignIn.mockRejectedValueOnce(new CredentialsError());

      const formData = new FormData();
      formData.set("email", "unknown@aldera.test");
      formData.set("password", "WrongPassword123!");

      const res = await loginAction({ ok: false }, formData);
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Email atau password salah.");
    });
  });

  describe("registerAction", () => {
    it("rejects invalid input schema", async () => {
      const res = await registerAction({
        name: "",
        email: "invalid-email",
        password: "123",
        phone: "",
      });
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Periksa kembali input Anda.");
    });

    it("rejects already registered email", async () => {
      const email = `existing_email_${Date.now()}@aldera.test`;
      await prisma.user.create({
        data: {
          email,
          name: "Existing User",
          password: "hashed_dummy_password",
          roles: ["CLIENT"],
        },
      });

      const res = await registerAction({
        name: "New Name",
        email,
        password: "Password123!",
        confirmPassword: "Password123!",
        phone: `0812${Date.now().toString().slice(-8)}`,
      });

      expect(res.ok).toBe(false);
      expect(res.message).toBe("Email sudah terdaftar.");
    });

    it("registers user successfully and dispatches WhatsApp OTP", async () => {
      const stamp = Date.now();
      const email = `reg_${stamp}@aldera.test`;
      const phone = `0819${stamp.toString().slice(-8)}`;
      mockSendWhatsApp.mockResolvedValueOnce({ success: true });

      const res = await registerAction({
        name: "New Client",
        email,
        password: "Password123!",
        confirmPassword: "Password123!",
        phone,
      });

      expect(res.ok).toBe(true);
      expect(res.requiresVerification).toBe(true);
      expect(res.email).toBe(email);

      // Verify User in DB
      const user = await prisma.user.findUnique({ where: { email } });
      expect(user).not.toBeNull();
      expect(user?.roles).toEqual(["CLIENT"]);

      // Verify OTP token in DB
      const token = await prisma.verificationToken.findFirst({
        where: { identifier: `62${phone.slice(1)}` },
      });
      expect(token).not.toBeNull();
      expect(token?.token).toMatch(/^\d{6}$/);

      // Verify WhatsApp dispatch
      expect(mockSendWhatsApp).toHaveBeenCalled();
    });
  });

  describe("verifyOtpAction & Lockout Defense", () => {
    it("rejects malformed or empty token", async () => {
      const res = await verifyOtpAction({
        identifier: "08123456789",
        token: "123", // not 6 digits
      });
      expect(res.ok).toBe(false);
      expect(res.message).toBe("Kode OTP harus berupa 6 digit angka.");
    });

    it("rejects when no active token found", async () => {
      const res = await verifyOtpAction({
        identifier: "089999999999",
        token: "123456",
      });
      expect(res.ok).toBe(false);
      expect(res.message).toContain("tidak valid atau belum diminta");
    });

    it("increments attempts on mismatch and locks out at 5 attempts", async () => {
      const phone = `62817${Date.now().toString().slice(-7)}`;
      const correctOtp = "654321";

      const tokenRecord = await prisma.verificationToken.create({
        data: {
          identifier: phone,
          token: correctOtp,
          type: "WHATSAPP_OTP",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          attempts: 0,
        },
      });

      // 1st failed attempt
      let res = await verifyOtpAction({ identifier: phone, token: "000000" });
      expect(res.ok).toBe(false);
      expect(res.attempts).toBe(1);
      expect(res.remainingAttempts).toBe(4);
      expect(res.isLocked).toBe(false);

      // Fast forward attempts to 4
      await prisma.verificationToken.update({
        where: { id: tokenRecord.id },
        data: { attempts: 4 },
      });

      // 5th failed attempt -> locked out
      res = await verifyOtpAction({ identifier: phone, token: "000000" });
      expect(res.ok).toBe(false);
      expect(res.attempts).toBe(5);
      expect(res.remainingAttempts).toBe(0);
      expect(res.isLocked).toBe(true);
      expect(res.message).toContain("Batas percobaan verifikasi telah habis");

      // Attempting again while locked out
      res = await verifyOtpAction({ identifier: phone, token: correctOtp });
      expect(res.ok).toBe(false);
      expect(res.isLocked).toBe(true);
    });

    it("verifies successfully with valid OTP code", async () => {
      const stamp = Date.now();
      const phone = `62818${stamp.toString().slice(-7)}`;
      const correctOtp = "987654";

      await prisma.user.create({
        data: {
          email: `verify_${stamp}@aldera.test`,
          name: "Verify User",
          password: "hashed_dummy_password",
          phone,
          roles: ["CLIENT"],
        },
      });

      await prisma.verificationToken.create({
        data: {
          identifier: phone,
          token: correctOtp,
          type: "WHATSAPP_OTP",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          attempts: 0,
        },
      });

      const res = await verifyOtpAction({ identifier: phone, token: correctOtp });
      expect(res.ok).toBe(true);
      expect(res.verified).toBe(true);

      const updatedUser = await prisma.user.findFirst({ where: { phone } });
      expect(updatedUser?.phoneVerified).not.toBeNull();
    });
  });

  describe("resendOtpAction & 60s Cooldown", () => {
    it("enforces 60-second cooldown from last requested token", async () => {
      const phone = `08199${Date.now().toString().slice(-6)}`;
      const normalizedPhone = `62${phone.slice(1)}`;

      await prisma.verificationToken.create({
        data: {
          identifier: normalizedPhone,
          token: "112233",
          type: "WHATSAPP_OTP",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          createdAt: new Date(Date.now() - 20 * 1000), // created 20 seconds ago (< 60s)
          attempts: 0,
        },
      });

      const res = await resendOtpAction(phone);
      expect(res.ok).toBe(false);
      expect(res.cooldownSeconds).toBeGreaterThan(0);
      expect(res.cooldownSeconds).toBeLessThanOrEqual(40);
      expect(res.message).toContain("Silakan tunggu");
    });
  });
});
