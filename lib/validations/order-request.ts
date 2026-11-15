import { z } from "zod";
export const submitOrderRequestSchema = z.object({
  projectTypeId: z.string().min(1, "Tipe proyek wajib dipilih"),
  features: z
    .array(z.string())
    .max(200)
    .refine((ids) => new Set(ids).size === ids.length, "Pilihan fitur berulang")
    .default([]),
  customFeatures: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional().default(""),
      })
    )
    .default([]),
  addOns: z
    .array(
      z.object({
        addOnId: z.string().min(1),
        months: z.number().int().min(1).max(1200).default(1),
      })
    )
    .max(100)
    .refine(
      (options) =>
        new Set(options.map((option) => option.addOnId)).size ===
        options.length,
      "Pilihan add-on berulang"
    )
    .default([]),
  dependentValues: z
    .record(z.string(), z.number().nonnegative().max(1000000))
    .default({}),
  urgency: z.enum(["normal", "urgent"]).default("normal"),
  deadline: z.iso.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  estimatedTotal: z.number().optional(),
});

export type SubmitOrderRequestInput = z.infer<typeof submitOrderRequestSchema>;
