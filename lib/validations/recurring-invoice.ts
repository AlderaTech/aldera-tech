import { z } from "zod";

export const recurringInvoiceSchema = z.object({
  name: z.string().trim().min(3).max(100),
  clientId: z.string().min(1, "Pilih client"),
  projectId: z.string().optional().or(z.literal("")),
  frequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  nextIssueDate: z.string(),
  dueDays: z.coerce.number().min(1).max(90).default(14),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        description: z.string().trim().min(1),
        quantity: z.coerce.number().min(0.01),
        price: z.coerce.number().min(0),
      })
    )
    .min(1),
});

export type RecurringInvoiceInput = z.infer<typeof recurringInvoiceSchema>;
