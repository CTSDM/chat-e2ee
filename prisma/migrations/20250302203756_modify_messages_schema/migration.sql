-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "content" BYTEA NOT NULL,
    "senderPublicUsername" TEXT NOT NULL,
    "receiverPublicUsername" TEXT NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderPublicUsername_fkey" FOREIGN KEY ("senderPublicUsername") REFERENCES "users"("publicUsername") ON DELETE CASCADE ON UPDATE CASCADE;
