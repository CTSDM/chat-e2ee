/*
  Warnings:

  - A unique constraint covering the columns `[publicUsernameOriginalCase]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicUsernameOriginalCase` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "publicUsernameOriginalCase" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_publicUsernameOriginalCase_key" ON "users"("publicUsernameOriginalCase");
