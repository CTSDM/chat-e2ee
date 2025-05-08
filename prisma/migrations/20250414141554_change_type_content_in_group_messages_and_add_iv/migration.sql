/*
  Warnings:

  - You are about to drop the column `sentAt` on the `group_messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "group_messages" DROP COLUMN "sentAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
