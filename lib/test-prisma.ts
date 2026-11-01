import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

interface GlobalWithPrisma {
  prisma?: PrismaClient;
}

const globalForPrisma = globalThis as unknown as GlobalWithPrisma;
let testPrisma: PrismaClient | null = null;

export function getTestPrisma(): PrismaClient {
  if (!testPrisma) {
    if (globalForPrisma.prisma) {
      testPrisma = globalForPrisma.prisma;
    } else {
      const connectionString =
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5432/aldera_tech?schema=public";
      const adapter = new PrismaPg({ connectionString });
      testPrisma = new PrismaClient({ adapter });
      globalForPrisma.prisma = testPrisma;
    }
  }
  return testPrisma;
}
