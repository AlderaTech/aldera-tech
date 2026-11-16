import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLES } from "@/lib/permissions";
import type { StaffWorkloadItem } from "./get-users-and-workload";

export async function getWorkloadPage(
  page: number,
  pageSize: number
): Promise<StaffWorkloadItem[]> {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  return prisma.$queryRaw<StaffWorkloadItem[]>`
    WITH staff AS (
      SELECT id, name, roles, avatar FROM "User"
      WHERE roles && ARRAY[${Prisma.join([...STAFF_ROLES])}]::"Role"[] AND "isActive" = true
    ), hours AS (
      SELECT "userId", ROUND(SUM("durationSec")::numeric / 3600, 1) AS value
      FROM "TimeEntry" WHERE "startedAt" >= ${weekAgo} GROUP BY "userId"
    ), tasks AS (
      SELECT "assigneeId", COUNT(*)::int AS active,
        COUNT(*) FILTER (WHERE priority IN ('HIGH','URGENT'))::int AS urgent
      FROM "Task" WHERE status <> 'DONE' GROUP BY "assigneeId"
    ), projects AS (
      SELECT a."userId", COUNT(*)::int AS active FROM "ProjectAssignment" a
      JOIN "Project" p ON p.id = a."projectId" WHERE p.status IN ('IN_PROGRESS','REVIEW') GROUP BY a."userId"
    )
    SELECT s.*, COALESCE(t.active,0)::int AS "activeTasks", COALESCE(t.urgent,0)::int AS "urgentTasks",
      COALESCE(p.active,0)::int AS "activeProjects", COALESCE(h.value,0)::float8 AS "hoursThisWeek",
      LEAST(100,ROUND(COALESCE(h.value,0) / 40 * 100))::int AS "capacityPct"
    FROM staff s LEFT JOIN hours h ON h."userId"=s.id LEFT JOIN tasks t ON t."assigneeId"=s.id
      LEFT JOIN projects p ON p."userId"=s.id
    ORDER BY "capacityPct" DESC, s.id ASC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
  `;
}
