import { z } from "zod";

export const INDONESIAN_PHONE_REGEX = /^(\+?62|0)8[1-9][0-9]{6,11}$/;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Nomor WhatsApp wajib diisi")
  .regex(
    INDONESIAN_PHONE_REGEX,
    "Nomor WhatsApp tidak valid (format: 08xxxxxxxxxx atau +628xxxxxxxxxx)"
  );

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter")
      .max(80, "Nama terlalu panjang"),
    email: z.string().trim().toLowerCase().email("Email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(100, "Password terlalu panjang"),
    confirmPassword: z.string(),
    phone: phoneSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama",
  });

export const verifyOtpSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Nomor WhatsApp atau identifier wajib diisi"),
  token: z
    .string()
    .trim()
    .length(6, "Kode OTP harus 6 digit angka")
    .regex(/^[0-9]{6}$/, "Kode OTP harus berupa 6 digit angka"),
  password: z.string().optional(),
});

export const resendOtpSchema = z.object({
  phone: phoneSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return phone.trim();
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return digits;
}
