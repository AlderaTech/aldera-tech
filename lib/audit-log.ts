import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
export async function logAudit(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    const hdrs = await headers();
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId ?? null,
        metadata: metadata ? (metadata as unknown as object) : undefined,
        ip:
          hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          hdrs.get("x-real-ip") ||
          null,
        userAgent: hdrs.get("user-agent") || null,
      },
    });
  } catch {
    console.error("Audit log gagal disimpan.");
  }
}
