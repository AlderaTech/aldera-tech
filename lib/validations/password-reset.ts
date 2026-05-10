import { z } from "zod";

export const requestResetSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().min(8, "Password minimal 8 karakter").max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama",
  });
