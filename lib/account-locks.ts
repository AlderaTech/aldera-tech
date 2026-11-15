import type { Prisma } from "@prisma/client";

export async function lockAccountKey(
  tx: Prisma.TransactionClient,
  key: string
) {
  await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtext(${key}))`;
}
