import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";

const projectDetailInclude = {
  client: { select: { id: true, name: true, email: true } },
  milestones: { orderBy: { order: "asc" } },
  tasks: {
    orderBy: [{ status: "asc" }, { order: "asc" }],
    include: {
      assignee: { select: { id: true, name: true } },
      milestone: { select: { id: true, title: true } },
    },
  },
  activities: {
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { name: true } } },
  },
  files: { orderBy: { createdAt: "desc" } },
  invoices: { orderBy: { issueDate: "desc" } },
  messages: {
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, roles: true } } },
  },
  timeEntries: {
    orderBy: { startedAt: "desc" },
    include: { user: { select: { id: true, name: true } } },
  },
  assignments: {
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.ProjectInclude;

export type AdminProjectDetail = Prisma.ProjectGetPayload<{
  include: typeof projectDetailInclude;
}>;

export function getProjectDetailStats(project: AdminProjectDetail) {
  const completedMilestones = project.milestones.filter(
    (milestone) => milestone.status === "COMPLETED"
  ).length;
  const openTasks = project.tasks.filter(
    (task) => task.status !== "DONE"
  ).length;
  const completedTimeEntries = project.timeEntries.filter(
    (entry) => entry.endedAt
  );
  const trackedSeconds = completedTimeEntries.reduce(
    (total, entry) => total + entry.durationSec,
    0
  );
  const activeMessages = project.messages.filter(
    (message) => !message.deletedAt
  );

  return {
    completedMilestones,
    openTasks,
    activeMessages,
    trackedHours: trackedSeconds / 3600,
  };
}

export async function getAdminProjectDetail(id: string) {
  return safeDb(
    async () =>
      await prisma.project.findUnique({
        where: { id },
        include: projectDetailInclude,
      }),
    null
  );
}
