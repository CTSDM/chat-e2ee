/*
  Warnings:

  - Added the required column `iv` to the `group_messages` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `content` on the `group_messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "group_messages" ADD COLUMN     "iv" BYTEA NOT NULL,
DROP COLUMN "content",
ADD COLUMN     "content" BYTEA NOT NULL;
