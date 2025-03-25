-- CreateTable
CREATE TABLE "group_key_symm" (
    "id" SERIAL NOT NULL,
    "groupID" TEXT NOT NULL,
    "publicUsername" TEXT NOT NULL,

    CONSTRAINT "group_key_symm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_key_symm_groupID_key" ON "group_key_symm"("groupID");

-- CreateIndex
CREATE UNIQUE INDEX "group_key_symm_publicUsername_key" ON "group_key_symm"("publicUsername");

-- AddForeignKey
ALTER TABLE "group_key_symm" ADD CONSTRAINT "group_key_symm_publicUsername_fkey" FOREIGN KEY ("publicUsername") REFERENCES "users"("publicUsername") ON DELETE CASCADE ON UPDATE CASCADE;
