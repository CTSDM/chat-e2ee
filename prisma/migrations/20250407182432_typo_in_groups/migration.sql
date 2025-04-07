/*
  Warnings:

  - You are about to drop the column `salt` on the `group_keys` table. All the data in the column will be lost.
  - Added the required column `iv` to the `group_keys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "group_keys" DROP COLUMN "salt",
ADD COLUMN     "iv" BYTEA NOT NULL;
