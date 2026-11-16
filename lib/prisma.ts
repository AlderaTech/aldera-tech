import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { assertTestDatabaseUrl } from "@/lib/test-database-url";

/**
 * PrismaClient singleton. Prisma 7 requires a driver adapter, we use
 * `@prisma/adapter-pg` which wraps the official `pg` driver. The adapter
 * reads `DATABASE_URL` at runtime; an empty URL during build produces a
 * lazy-failing client which is fine for static generation.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
if (process.env.NODE_ENV === "test")
  assertTestDatabaseUrl(process.env.DATABASE_URL);

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? "";
  if (process.env.NODE_ENV === "test") assertTestDatabaseUrl(connectionString);
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
