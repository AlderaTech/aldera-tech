-- Preserve existing role data. These values do not grant application permissions.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'OWNER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'DESIGNER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ACCOUNTANT';
