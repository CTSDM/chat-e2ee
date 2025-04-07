/*
  Warnings:

  - Added the required column `keyEncrypted` to the `group_members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "group" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "group_members" ADD COLUMN     "keyEncrypted" BYTEA NOT NULL;
