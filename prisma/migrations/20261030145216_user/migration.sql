-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "googleIdHash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleIdHash_key" ON "User"("googleIdHash");
