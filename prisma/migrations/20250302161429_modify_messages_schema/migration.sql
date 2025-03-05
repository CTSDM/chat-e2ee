/*
  Warnings:

  - You are about to drop the column `content` on the `messages` table. All the data in the column will be lost.
  - Added the required column `contentReceived` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentSent` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "messages" DROP COLUMN "content",
ADD COLUMN     "contentReceived" BYTEA NOT NULL,
ADD COLUMN     "contentSent" BYTEA NOT NULL;
