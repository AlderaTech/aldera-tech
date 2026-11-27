import { z } from "zod";

const optionalId = z.preprocess(
  (value) => (value === null || value === "" ? undefined : value),
  z.string().trim().min(1).optional()
);
export const uploadContextSchema = z
  .object({
    projectId: optionalId,
    invoiceId: optionalId,
    topupId: z.preprocess(
      (value) => (value === null || value === "" ? undefined : value),
      z.coerce.number().int().positive().safe().optional()
    ),
  })
  .refine(
    (value) =>
      [value.projectId, value.invoiceId, value.topupId].filter(
        (id) => id !== undefined
      ).length <= 1,
    "Gunakan satu tujuan unggahan saja."
  );
