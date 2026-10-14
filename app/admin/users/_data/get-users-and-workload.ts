import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { STAFF_ROLES } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export const WEEKLY_CAPACITY_HOURS = 40;

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  roles: Role[];
  isActive: boolean;
  createdAt: Date;
  _count: { projects: number; invoices: number };
};

export type StaffWorkloadItem = {
  id: string;
  name: string;
  roles: Role[];
  avatar: string | null;
  activeTasks: number;
  urgentTasks: number;
  activeProjects: number;
  hoursThisWeek: number;
  capacityPct: number;
};

export async function getUsersAndWorkloadData() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [users, staffWorkload] = await Promise.all([
    safeDb(
      async () =>
        await prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { projects: true, invoices: true } },
          },
        }),
      [] as UserListItem[]
    ),
    safeDb(async () => {
      const staff = await prisma.user.findMany({
        where: { roles: { hasSome: [...STAFF_ROLES] }, isActive: true },
        select: {
          id: true,
          name: true,
          roles: true,
          avatar: true,
          assignedTasks: {
            where: { status: { notIn: ["DONE"] } },
            select: { id: true, priority: true },
          },
          projectAssignments: {
            select: { project: { select: { id: true, status: true } } },
          },
          timeEntries: {
            where: { startedAt: { gte: weekAgo } },
            select: { durationSec: true },
          },
        },
      });

      return staff
        .map((u) => {
          const hoursThisWeek = +(
            u.timeEntries.reduce((s, e) => s + e.durationSec, 0) / 3600
          ).toFixed(1);
          const activeProjects = u.projectAssignments.filter(
            (a) =>
              a.project.status === "IN_PROGRESS" ||
              a.project.status === "REVIEW"
          ).length;
          const urgentTasks = u.assignedTasks.filter(
            (t) => t.priority === "URGENT" || t.priority === "HIGH"
          ).length;

          return {
            id: u.id,
            name: u.name,
            roles: u.roles,
            avatar: u.avatar,
            activeTasks: u.assignedTasks.length,
            urgentTasks,
            activeProjects,
            hoursThisWeek,
            capacityPct: Math.min(
              100,
              Math.round((hoursThisWeek / WEEKLY_CAPACITY_HOURS) * 100)
            ),
          };
        })
        .sort((a, b) => b.capacityPct - a.capacityPct);
    }, [] as StaffWorkloadItem[]),
  ]);

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.roles.includes("ADMIN")).length,
    developer: users.filter((u) => u.roles.includes("DEVELOPER")).length,
    client: users.filter((u) => u.roles.includes("CLIENT")).length,
  };

  return { users, staffWorkload, counts };
}
