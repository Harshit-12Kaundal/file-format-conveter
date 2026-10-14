-- CreateTable
CREATE TABLE "FileShareNotification" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileShareNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FileShareNotification_recipientId_createdAt_idx" ON "FileShareNotification"("recipientId", "createdAt");

-- AddForeignKey
ALTER TABLE "FileShareNotification" ADD CONSTRAINT "FileShareNotification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShareNotification" ADD CONSTRAINT "FileShareNotification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;