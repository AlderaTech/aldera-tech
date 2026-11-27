import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { assertTestDatabaseUrl } from "@/lib/test-database-url";

interface GlobalWithPrisma {
  prisma?: PrismaClient;
}

const globalForPrisma = globalThis as unknown as GlobalWithPrisma;
let testPrisma: PrismaClient | null = null;

export function getTestPrisma(): PrismaClient {
  const connectionString = assertTestDatabaseUrl(process.env.DATABASE_URL);
  if (!testPrisma) {
    if (globalForPrisma.prisma) {
      testPrisma = globalForPrisma.prisma;
    } else {
      const adapter = new PrismaPg({ connectionString });
      testPrisma = new PrismaClient({ adapter });
      globalForPrisma.prisma = testPrisma;
    }
  }
  return testPrisma;
}
