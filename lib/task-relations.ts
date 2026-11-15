import { prisma } from "@/lib/prisma";
export async function validateTaskRelations(
  projectId: string,
  milestoneId?: string,
  assigneeId?: string
) {
  if (
    milestoneId &&
    !(await prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
      select: { id: true },
    }))
  )
    return "Milestone harus berasal dari proyek yang sama.";
  if (
    assigneeId &&
    !(await prisma.user.findFirst({
      where: {
        id: assigneeId,
        isActive: true,
        roles: { hasSome: ["ADMIN", "DEVELOPER"] },
      },
      select: { id: true },
    }))
  )
    return "Penanggung jawab harus anggota tim aktif.";
  return null;
}
