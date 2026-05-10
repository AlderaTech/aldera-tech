import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 configuration. The datasource URL and seed command live here
 * instead of inside `schema.prisma` and `package.json` respectively.
 *
 * We use `process.env.DATABASE_URL` directly rather than the `env()` helper
 * so that commands that don't need a DB connection (e.g. `prisma generate`)
 * can still run without a populated .env file.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
