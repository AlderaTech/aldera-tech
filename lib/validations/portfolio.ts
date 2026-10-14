import { z } from "zod";

export const caseStudySchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Judul minimal 3 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug minimal 3 karakter")
    .max(120, "Slug maksimal 120 karakter")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug hanya boleh huruf kecil, angka, dan strip (-)"
    ),
  client: z
    .string()
    .trim()
    .min(2, "Nama klien minimal 2 karakter")
    .max(100, "Nama klien maksimal 100 karakter"),
  industry: z
    .string()
    .trim()
    .min(2, "Industri minimal 2 karakter")
    .max(100, "Industri maksimal 100 karakter"),
  summary: z.string().trim().min(10, "Ringkasan eksekutif minimal 10 karakter"),
  challenge: z
    .string()
    .trim()
    .min(10, "Deskripsi tantangan minimal 10 karakter"),
  solution: z
    .string()
    .trim()
    .min(10, "Deskripsi solusi teknis minimal 10 karakter"),
  result: z.string().trim().min(10, "Deskripsi hasil minimal 10 karakter"),
  featuredImage: z.string().optional().or(z.literal("")),
  techStack: z
    .array(z.string().trim())
    .min(1, "Pilih atau masukkan minimal 1 teknologi"),
  published: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0),
});

export type CaseStudyInput = z.infer<typeof caseStudySchema>;
