/*
  Warnings:

  - Added the required column `iv` to the `group_key_symm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `group_key_symm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "group_key_symm" ADD COLUMN     "iv" BYTEA NOT NULL,
ADD COLUMN     "key" BYTEA NOT NULL;
