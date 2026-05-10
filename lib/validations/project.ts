import { z } from "zod";

export const projectStatusEnum = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "CANCELLED",
]);
export const milestoneStatusEnum = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "BLOCKED",
]);

export const projectCreateSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(5).max(5000),
  clientId: z.string().min(1, "Pilih client"),
  deadline: z.string().optional().or(z.literal("")),
  budget: z.string().optional().or(z.literal("")),
});

export const projectUpdateSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(5).max(5000),
  status: projectStatusEnum,
  progress: z.coerce.number().min(0).max(100),
  autoProgress: z.coerce.boolean().optional().default(false),
  deadline: z.string().optional().or(z.literal("")),
  budget: z.string().optional().or(z.literal("")),
});

export const milestoneSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  status: milestoneStatusEnum,
  dueDate: z.string().optional().or(z.literal("")),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type MilestoneInput = z.infer<typeof milestoneSchema>;
