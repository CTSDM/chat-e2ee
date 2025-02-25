/*
  Warnings:

  - You are about to drop the column `private` on the `users` table. All the data in the column will be lost.
  - Changed the type of `privateKeyEncrypted` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `salt` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `iv` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "private",
DROP COLUMN "privateKeyEncrypted",
ADD COLUMN     "privateKeyEncrypted" BYTEA NOT NULL,
DROP COLUMN "salt",
ADD COLUMN     "salt" BYTEA NOT NULL,
DROP COLUMN "iv",
ADD COLUMN     "iv" BYTEA NOT NULL;
