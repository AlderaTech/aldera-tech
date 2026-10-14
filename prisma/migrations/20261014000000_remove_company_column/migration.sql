-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN IF EXISTS "clientCompany";

-- AlterTable
ALTER TABLE "Testimonial" DROP COLUMN IF EXISTS "company";

-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "company";
