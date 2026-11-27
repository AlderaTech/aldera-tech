-- CreateEnum
CREATE TYPE "FileScope" AS ENUM ('PRIVATE_LEGACY', 'PUBLIC_MEDIA', 'PROJECT', 'INVOICE_PROOF', 'TOPUP_PROOF');

-- CreateEnum
CREATE TYPE "InvoicePurpose" AS ENUM ('PROJECT', 'AI_RELAY_TOPUP');

-- CreateEnum
CREATE TYPE "BalanceEffectKind" AS ENUM ('CREDIT', 'REFUND');

-- CreateEnum
CREATE TYPE "BalanceEffectStatus" AS ENUM ('PENDING', 'APPLIED', 'REVIEW');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "securityVersion" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "scope" "FileScope" NOT NULL DEFAULT 'PRIVATE_LEGACY',
ADD COLUMN     "topupId" INTEGER;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "purpose" "InvoicePurpose" NOT NULL DEFAULT 'PROJECT';

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "subjectUserId" TEXT;

-- CreateTable
CREATE TABLE "InvoiceBalanceEffect" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "kind" "BalanceEffectKind" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "BalanceEffectStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceBalanceEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSyncState" (
    "id" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "appliedRevision" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoiceBalanceEffect_status_createdAt_idx" ON "InvoiceBalanceEffect"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceBalanceEffect_invoiceId_kind_key" ON "InvoiceBalanceEffect"("invoiceId", "kind");

-- AddForeignKey
ALTER TABLE "InvoiceBalanceEffect" ADD CONSTRAINT "InvoiceBalanceEffect_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
