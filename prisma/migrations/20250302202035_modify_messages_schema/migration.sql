/*
  Warnings:

  - A unique constraint covering the columns `[publicUsername]` on the table `backups` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "backups_publicUsername_key" ON "backups"("publicUsername");
