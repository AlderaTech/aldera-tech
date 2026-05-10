import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(200),
  slug: z
    .string()
    .trim()
    .min(3, "Slug minimal 3 karakter")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda -"),
  excerpt: z.string().trim().max(300).optional().or(z.literal("")),
  content: z.string().min(10, "Konten terlalu singkat"),
  featuredImage: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  published: z.boolean().optional(),
  scheduledAt: z.string().optional().or(z.literal("")),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
