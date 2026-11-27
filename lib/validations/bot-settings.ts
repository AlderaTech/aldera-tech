import { z } from "zod";
export const paymentMethodInputSchema = z.object({
  id: z.string().min(1).max(200).optional(),
  type: z.enum(["BANK_TRANSFER", "EWALLET", "QRIS"]).optional(),
  name: z.string().trim().min(1).max(100),
  accountNumber: z.string().trim().max(200).optional(),
  accountName: z.string().trim().max(200).optional(),
  qrisImageUrl: z.string().max(2000).nullable().optional(),
  instructions: z.string().max(10000).nullable().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(10000).optional(),
});
