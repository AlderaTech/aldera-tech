import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { lockAccountKey } from "@/lib/account-locks";

const WINDOW_MS = 15 * 60_000;
function key(kind: string, value: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Authentication configuration unavailable.");
  return `login:${kind}:${createHmac("sha256", secret).update(value).digest("hex")}`;
}

/** Shared database counters work across replicas and never store raw emails/IPs. */
export async function consumeLoginAttempt(
  email: string,
  ip: string | null
): Promise<boolean> {
  const limits = [
    { key: key("account", email.trim().toLowerCase()), limit: 10 },
  ];
  if (ip) limits.push({ key: key("network", ip), limit: 120 });
  limits.sort((a, b) => a.key.localeCompare(b.key));
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    for (const item of limits) await lockAccountKey(tx, item.key);
    const records = await tx.authRateLimit.findMany({
      where: { key: { in: limits.map((l) => l.key) } },
    });
    if (
      limits.some((item) =>
        records.some(
          (r) =>
            r.key === item.key && r.resetAt > now && r.attempts >= item.limit
        )
      )
    )
      return false;
    for (const item of limits) {
      const existing = records.find((r) => r.key === item.key);
      const active = existing && existing.resetAt > now;
      await tx.authRateLimit.upsert({
        where: { key: item.key },
        create: {
          key: item.key,
          attempts: 1,
          resetAt: new Date(now.getTime() + WINDOW_MS),
        },
        update: {
          attempts: active ? { increment: 1 } : 1,
          resetAt: active
            ? existing.resetAt
            : new Date(now.getTime() + WINDOW_MS),
        },
      });
    }
    return true;
  });
}

export async function clearLoginAttempts(email: string) {
  await prisma.authRateLimit.deleteMany({
    where: { key: key("account", email.trim().toLowerCase()) },
  });
}

export async function cleanupLoginAttempts() {
  await prisma.$executeRaw`DELETE FROM "AuthRateLimit" WHERE "resetAt" < NOW() AND "key" IN (SELECT "key" FROM "AuthRateLimit" WHERE "resetAt" < NOW() ORDER BY "resetAt" LIMIT 1000)`;
}
