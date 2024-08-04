/*
  Warnings:

  - Added the required column `duration` to the `Poll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Poll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startTime" TIMESTAMP(3),
ADD COLUMN     "title" TEXT NOT NULL;
