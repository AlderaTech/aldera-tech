import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().min(3, "Subjek minimal 3 karakter").max(200),
  message: z
    .string()
    .trim()
    .min(10, "Pesan minimal 10 karakter")
    .max(5000, "Pesan terlalu panjang"),
});

export type ContactInput = z.infer<typeof contactSchema>;
