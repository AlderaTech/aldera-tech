-- CreateEnum
CREATE TYPE "BlogReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "pinnedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "blog_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_reactions" (
    "id" TEXT NOT NULL,
    "type" "BlogReactionType" NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_bot_configs" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "ticketTemplate" TEXT NOT NULL,
    "importantNotes" TEXT NOT NULL,
    "nextStepsNotes" TEXT NOT NULL,
    "topupAmounts" JSONB NOT NULL DEFAULT '[25000, 50000, 100000, 250000, 500000]',
    "adminTelegramUsername" TEXT NOT NULL DEFAULT 'aldera_admin',
    "welcomeText" TEXT,
    "helpText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_bot_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_method_settings" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BANK',
    "name" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "qrisImageUrl" TEXT,
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_method_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogPost_published_isPinned_publishedAt_idx" ON "BlogPost"("published", "isPinned", "publishedAt");

-- CreateIndex
CREATE INDEX "blog_comments_postId_createdAt_idx" ON "blog_comments"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "blog_reactions_postId_type_idx" ON "blog_reactions"("postId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "blog_reactions_postId_userId_key" ON "blog_reactions"("postId", "userId");

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_reactions" ADD CONSTRAINT "blog_reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_reactions" ADD CONSTRAINT "blog_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
