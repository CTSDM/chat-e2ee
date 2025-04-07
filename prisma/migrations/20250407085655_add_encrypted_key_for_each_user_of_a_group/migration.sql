/*
  Warnings:

  - The primary key for the `group_keys` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `group_keys` table. All the data in the column will be lost.
  - You are about to drop the column `keyEncrypted` on the `group_members` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupId,userId]` on the table `group_keys` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "group_keys" DROP CONSTRAINT "group_keys_pkey",
DROP COLUMN "id",
ADD COLUMN     "finalKey" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "group_members" DROP COLUMN "keyEncrypted";

-- CreateIndex
CREATE UNIQUE INDEX "group_keys_groupId_userId_key" ON "group_keys"("groupId", "userId");
