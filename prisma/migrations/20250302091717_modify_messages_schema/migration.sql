/*
  Warnings:

  - You are about to drop the column `receiver` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `sender` on the `messages` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverPublicUsername` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderPublicUsername` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiver_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_fkey";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "receiver",
DROP COLUMN "sender",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "receiverPublicUsername" TEXT NOT NULL,
ADD COLUMN     "senderPublicUsername" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderPublicUsername_fkey" FOREIGN KEY ("senderPublicUsername") REFERENCES "users"("publicUsername") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverPublicUsername_fkey" FOREIGN KEY ("receiverPublicUsername") REFERENCES "users"("publicUsername") ON DELETE CASCADE ON UPDATE CASCADE;
