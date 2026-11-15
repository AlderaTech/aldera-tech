import { z } from "zod";

const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Gunakan tanggal YYYY-MM-DD.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00`);
    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() >= 1 &&
      date.getFullYear() === Number(value.slice(0, 4)) &&
      date.getMonth() + 1 === Number(value.slice(5, 7)) &&
      date.getDate() === Number(value.slice(8, 10))
    );
  }, "Tanggal tidak valid.");

export const exportRangeSchema = z
  .object({
    from: calendarDate.optional(),
    to: calendarDate.optional(),
  })
  .refine(({ from, to }) => !from || !to || from <= to, {
    message: "Tanggal mulai harus sebelum atau sama dengan tanggal akhir.",
    path: ["to"],
  });

export function resolveExportRange(
  input: z.infer<typeof exportRangeSchema>,
  now: Date
) {
  const from = input.from
    ? new Date(input.from)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const to = input.to ? new Date(input.to) : new Date(now);
  if (input.to) to.setHours(23, 59, 59, 999);
  return from <= to ? { from, to } : null;
}
