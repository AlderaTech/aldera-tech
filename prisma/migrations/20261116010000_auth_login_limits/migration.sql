CREATE TABLE IF NOT EXISTS "AuthRateLimit" (
    "key" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AuthRateLimit_pkey" PRIMARY KEY ("key")
);
CREATE INDEX IF NOT EXISTS "AuthRateLimit_resetAt_idx" ON "AuthRateLimit"("resetAt");
CREATE INDEX IF NOT EXISTS "Invoice_status_paidAt_idx" ON "Invoice"("status", "paidAt");
