/*
  Warnings:

  - You are about to drop the column `groupID` on the `group_messages` table. All the data in the column will be lost.
  - You are about to drop the column `senderID` on the `group_messages` table. All the data in the column will be lost.
  - Added the required column `groupId` to the `group_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `group_messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "group_messages" DROP COLUMN "groupID",
DROP COLUMN "senderID",
ADD COLUMN     "groupId" TEXT NOT NULL,
ADD COLUMN     "senderId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
