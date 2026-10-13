import type { TaskPriority, TaskStatus } from "@prisma/client";

export const TASK_STATUSES: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
];

export const TASK_PRIORITIES: TaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export type BoardTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  dueDate: Date | null;
  completedAt: Date | null;
  assigneeId: string | null;
  assignee: { id: string; name: string } | null;
  milestoneId: string | null;
  milestone: { id: string; title: string } | null;
};

export type Option = { id: string; name: string };
export type MilestoneOption = { id: string; title: string };
export type Columns = Record<TaskStatus, BoardTask[]>;

export function makeColumns(tasks: BoardTask[]): Columns {
  return TASK_STATUSES.reduce((acc, status) => {
    acc[status] = tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order);
    return acc;
  }, {} as Columns);
}

export function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function findTaskStatus(
  columns: Columns,
  taskId: string
): TaskStatus | undefined {
  return TASK_STATUSES.find((status) =>
    columns[status].some((task) => task.id === taskId)
  );
}

export function serializeColumns(
  columns: Columns
): Record<TaskStatus, string[]> {
  return TASK_STATUSES.reduce(
    (acc, status) => {
      acc[status] = columns[status].map((task) => task.id);
      return acc;
    },
    {} as Record<TaskStatus, string[]>
  );
}
