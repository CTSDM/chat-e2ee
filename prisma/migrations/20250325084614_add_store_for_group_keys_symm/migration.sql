/*
  Warnings:

  - A unique constraint covering the columns `[groupID,publicUsername]` on the table `group_key_symm` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "group_key_symm_groupID_key";

-- DropIndex
DROP INDEX "group_key_symm_publicUsername_key";

-- CreateIndex
CREATE UNIQUE INDEX "group_key_symm_groupID_publicUsername_key" ON "group_key_symm"("groupID", "publicUsername");
