/*
  Warnings:

  - You are about to drop the column `ivArr` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `saltArr` on the `users` table. All the data in the column will be lost.
  - The `privateKeyEncrypted` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `salt` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `iv` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "content" INTEGER[];

-- AlterTable
ALTER TABLE "users" DROP COLUMN "ivArr",
DROP COLUMN "saltArr",
DROP COLUMN "privateKeyEncrypted",
ADD COLUMN     "privateKeyEncrypted" INTEGER[],
DROP COLUMN "salt",
ADD COLUMN     "salt" INTEGER[],
DROP COLUMN "iv",
ADD COLUMN     "iv" INTEGER[];
