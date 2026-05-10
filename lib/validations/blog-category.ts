import { z } from "zod";

export const blogCategorySchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  slug: z
    .string()
    .trim()
    .min(2, "Slug minimal 2 karakter")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda -"),
  description: z.string().trim().max(180).optional().or(z.literal("")),
});

export type BlogCategoryInput = z.infer<typeof blogCategorySchema>;
