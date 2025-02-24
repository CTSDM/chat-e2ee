/*
  Warnings:

  - You are about to drop the column `privateId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `publicId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[privateUsername]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicUsername]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `privateUsername` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicUsername` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_privateId_key";

-- DropIndex
DROP INDEX "users_publicId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "privateId",
DROP COLUMN "publicId",
ADD COLUMN     "privateUsername" TEXT NOT NULL,
ADD COLUMN     "publicUsername" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_privateUsername_key" ON "users"("privateUsername");

-- CreateIndex
CREATE UNIQUE INDEX "users_publicUsername_key" ON "users"("publicUsername");
