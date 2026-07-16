/*
  Warnings:

  - Added the required column `userEmail` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Trip" ADD COLUMN     "userEmail" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;
