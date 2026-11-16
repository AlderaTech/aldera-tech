import { prisma } from "@/lib/prisma";
import { getWorkloadPage } from "./workload-page";
import { STAFF_ROLES } from "@/lib/permissions";
import type { Prisma, Role } from "@prisma/client";

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

export async function getUsersAndWorkloadData({
  page = 1,
  role = "ALL",
  workload = false,
}: { page?: number; role?: string; workload?: boolean } = {}) {
  const pageSize = 20;
  const where: Prisma.UserWhereInput =
    role === "ALL" ? {} : { roles: { has: role as Role } };
  const staffWhere: Prisma.UserWhereInput = {
    roles: { hasSome: [...STAFF_ROLES] },
    isActive: true,
  };
  const [all, admin, developer, client, totalCount, users, staffWorkload] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { roles: { has: "ADMIN" } } }),
      prisma.user.count({ where: { roles: { has: "DEVELOPER" } } }),
      prisma.user.count({ where: { roles: { has: "CLIENT" } } }),
      prisma.user.count({ where: workload ? staffWhere : where }),
      workload
        ? Promise.resolve([] as UserListItem[])
        : prisma.user.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "asc" }],
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              roles: true,
              isActive: true,
              createdAt: true,
              _count: { select: { projects: true, invoices: true } },
            },
          }),
      workload
        ? getWorkloadPage(page, pageSize)
        : Promise.resolve([] as StaffWorkloadItem[]),
    ]);
  return {
    users,
    staffWorkload,
    counts: { all, admin, developer, client },
    totalCount,
    pageSize,
  };
}
