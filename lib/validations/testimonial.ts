import { z } from "zod";

export const testimonialSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, "Nama klien minimal 2 karakter")
    .max(100, "Nama klien maksimal 100 karakter"),
  clientRole: z
    .string()
    .trim()
    .max(100, "Jabatan maksimal 100 karakter")
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .trim()
    .min(10, "Ulasan testimoni minimal 10 karakter")
    .max(1000, "Ulasan testimoni maksimal 1000 karakter"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating minimal 1 bintang")
    .max(5, "Rating maksimal 5 bintang"),
  avatar: z.string().optional().or(z.literal("")),
  published: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0),
  projectId: z.string().optional().or(z.literal("")),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const clientProjectReviewSchema = z.object({
  projectId: z.string().min(1, "ID proyek wajib diisi"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Pilih rating minimal 1 bintang")
    .max(5, "Rating maksimal 5 bintang"),
  content: z
    .string()
    .trim()
    .min(10, "Ulasan minimal 10 karakter")
    .max(1000, "Ulasan maksimal 1000 karakter"),
  clientRole: z
    .string()
    .trim()
    .max(100, "Jabatan maksimal 100 karakter")
    .optional()
    .or(z.literal("")),
});

export type ClientProjectReviewInput = z.infer<
  typeof clientProjectReviewSchema
>;
