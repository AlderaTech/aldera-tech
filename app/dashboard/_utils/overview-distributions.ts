import type {
  InvoiceStatus,
  MilestoneStatus,
  TaskStatus,
} from "@prisma/client";
export type WorkDistribution = {
  completed: number;
  active: number;
  pending: number;
};
export type InvoiceDistribution = {
  paid: number;
  waiting: number;
  verification: number;
};

export function summarizeWork(
  milestones: { status: MilestoneStatus; _count: { _all: number } }[],
  tasks: { status: TaskStatus; _count: { _all: number } }[]
): WorkDistribution {
  const result = { completed: 0, active: 0, pending: 0 };
  for (const row of milestones) {
    const key =
      row.status === "COMPLETED"
        ? "completed"
        : row.status === "IN_PROGRESS"
          ? "active"
          : "pending";
    result[key] += row._count._all;
  }
  for (const row of tasks) {
    const key =
      row.status === "DONE"
        ? "completed"
        : ["IN_PROGRESS", "REVIEW"].includes(row.status)
          ? "active"
          : "pending";
    result[key] += row._count._all;
  }
  return result;
}

export function summarizeInvoices(
  rows: { status: InvoiceStatus; _count: { _all: number } }[]
): InvoiceDistribution {
  const count = (statuses: InvoiceStatus[]) =>
    rows
      .filter((r) => statuses.includes(r.status))
      .reduce((sum, r) => sum + r._count._all, 0);
  return {
    paid: count(["PAID"]),
    waiting: count(["SENT", "OVERDUE"]),
    verification: count(["PENDING_VERIFICATION"]),
  };
}
