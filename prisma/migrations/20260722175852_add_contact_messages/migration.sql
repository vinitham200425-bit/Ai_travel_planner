-- CreateTable
CREATE TABLE "public"."ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactMessage_email_idx" ON "public"."ContactMessage"("email");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "public"."ContactMessage"("createdAt");
