/*
  Warnings:

  - You are about to drop the column `publicUsernameOriginalCase` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_publicUsernameOriginalCase_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "publicUsernameOriginalCase";
