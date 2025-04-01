/*
  Warnings:

  - You are about to drop the column `content` on the `direct_messages` table. All the data in the column will be lost.
  - Added the required column `contentEncrypted` to the `direct_messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "direct_messages" DROP COLUMN "content",
ADD COLUMN     "contentEncrypted" BYTEA NOT NULL;
