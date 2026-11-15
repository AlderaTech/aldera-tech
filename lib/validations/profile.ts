import { z } from "zod";
import { phoneSchema, normalizePhone } from "@/lib/validations/auth";

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi")
    .max(80, "Nama maksimal 80 karakter"),
  phone: z
    .union([phoneSchema, z.literal(""), z.null()])
    .transform((value) => (value ? normalizePhone(value) : null)),
});
