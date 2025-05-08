-- AddForeignKey
ALTER TABLE "group_message_read_status" ADD CONSTRAINT "group_message_read_status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_message_read_status" ADD CONSTRAINT "group_message_read_status_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "group_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
