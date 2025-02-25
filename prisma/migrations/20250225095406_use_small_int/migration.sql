/*
  Warnings:

  - You are about to alter the column `privateKeyEncrypted` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "privateKeyEncrypted" SET DATA TYPE SMALLINT[];
