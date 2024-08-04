-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'STARTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';
