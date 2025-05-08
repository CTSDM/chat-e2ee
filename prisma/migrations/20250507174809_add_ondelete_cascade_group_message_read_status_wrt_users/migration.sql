-- DropForeignKey
ALTER TABLE "group_message_read_status" DROP CONSTRAINT "group_message_read_status_userId_fkey";

-- AddForeignKey
ALTER TABLE "group_message_read_status" ADD CONSTRAINT "group_message_read_status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
