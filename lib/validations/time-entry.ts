import { z } from "zod";

export const manualTimeEntrySchema = z.object({
  description: z.string().trim().min(1, "Deskripsi wajib diisi.").max(1000),
  minutes: z.coerce
    .number()
    .finite()
    .positive("Durasi harus lebih dari nol.")
    .max(Math.floor(2_147_483_647 / 60), "Durasi melebihi batas pencatatan."),
  billable: z.boolean(),
});
