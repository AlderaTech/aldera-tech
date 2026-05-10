import { z } from "zod";

export const taskStatusEnum = z.enum([
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
]);

export const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const taskMutationSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  status: taskStatusEnum.default("BACKLOG"),
  priority: taskPriorityEnum.default("MEDIUM"),
  dueDate: z.string().optional().or(z.literal("")),
  milestoneId: z.string().optional().or(z.literal("")),
  assigneeId: z.string().optional().or(z.literal("")),
});

export const taskReorderSchema = z.object({
  columns: z.record(taskStatusEnum, z.array(z.string().min(1))),
});

export type TaskMutationInput = z.infer<typeof taskMutationSchema>;
