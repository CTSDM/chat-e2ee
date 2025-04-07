-- DropForeignKey
ALTER TABLE "group_keys" DROP CONSTRAINT "group_keys_groupId_fkey";

-- DropForeignKey
ALTER TABLE "group_keys" DROP CONSTRAINT "group_keys_userId_fkey";

-- AddForeignKey
ALTER TABLE "group_keys" ADD CONSTRAINT "group_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_keys" ADD CONSTRAINT "group_keys_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
