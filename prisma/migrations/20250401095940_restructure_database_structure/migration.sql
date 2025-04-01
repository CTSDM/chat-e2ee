/*
  Warnings:

  - Added the required column `iv` to the `direct_messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "direct_messages" ADD COLUMN     "iv" BYTEA NOT NULL;
