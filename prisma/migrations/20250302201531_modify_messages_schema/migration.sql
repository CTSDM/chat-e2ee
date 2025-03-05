/*
  Warnings:

  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiverPublicUsername_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderPublicUsername_fkey";

-- DropTable
DROP TABLE "messages";

-- CreateTable
CREATE TABLE "backups" (
    "id" SERIAL NOT NULL,
    "content" BYTEA NOT NULL,
    "publicUsername" TEXT NOT NULL,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "backups" ADD CONSTRAINT "backups_publicUsername_fkey" FOREIGN KEY ("publicUsername") REFERENCES "users"("publicUsername") ON DELETE CASCADE ON UPDATE CASCADE;
