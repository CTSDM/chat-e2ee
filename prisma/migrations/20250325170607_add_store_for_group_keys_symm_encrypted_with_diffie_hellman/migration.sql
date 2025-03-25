-- CreateTable
CREATE TABLE "GroupKeySymmSetup" (
    "id" SERIAL NOT NULL,
    "groupID" TEXT NOT NULL,
    "key" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "publicUsername" TEXT NOT NULL,
    "encryptedBy" TEXT NOT NULL,

    CONSTRAINT "GroupKeySymmSetup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GroupKeySymmSetup" ADD CONSTRAINT "GroupKeySymmSetup_publicUsername_fkey" FOREIGN KEY ("publicUsername") REFERENCES "users"("publicUsername") ON DELETE CASCADE ON UPDATE CASCADE;
