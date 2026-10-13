import { z } from "zod";

export const proposalItemSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.coerce.number().min(0.01),
  price: z.coerce.number().min(0),
});

export const proposalCreateSchema = z.object({
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().min(10, "Konten terlalu pendek"),
  clientName: z.string().trim().min(2).max(100),
  clientEmail: z.string().trim().toLowerCase().email(),
  clientCompany: z.string().trim().max(120).optional().or(z.literal("")),
  clientPhone: z.string().trim().max(30).optional().or(z.literal("")),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  expiresAt: z.string().optional().or(z.literal("")),
  items: z.array(proposalItemSchema).min(1, "Minimal 1 item"),
});

export const signatureSchema = z.object({
  signatureDataUrl: z
    .string()
    .regex(/^data:image\/(png|jpeg);base64,/, "Signature harus berupa image"),
  signatureName: z.string().trim().min(2).max(100),
});

export type ProposalCreateInput = z.infer<typeof proposalCreateSchema>;
