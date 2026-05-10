import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, "Wajib diisi").max(500),
  quantity: z.coerce.number().min(0.01),
  price: z.coerce.number().min(0),
});

export const invoiceCreateSchema = z.object({
  clientId: z.string().min(1, "Pilih client"),
  projectId: z.string().optional().or(z.literal("")),
  issueDate: z.string(),
  dueDate: z.string(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  items: z.array(invoiceItemSchema).min(1, "Minimal 1 item"),
});

export const invoiceStatusUpdateSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]),
});

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
