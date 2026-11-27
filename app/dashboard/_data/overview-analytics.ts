import { prisma } from "@/lib/prisma";
import {
  summarizeInvoices,
  summarizeWork,
} from "../_utils/overview-distributions";

export async function getOverviewAnalytics(userId: string) {
  const [milestones, tasks, invoices] = await Promise.all([
    prisma.milestone.groupBy({
      by: ["status"],
      where: { project: { clientId: userId } },
      _count: { _all: true },
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: { project: { clientId: userId } },
      _count: { _all: true },
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      where: { clientId: userId },
      _count: { _all: true },
    }),
  ]);
  return {
    work: summarizeWork(milestones, tasks),
    payments: summarizeInvoices(invoices),
  };
}
