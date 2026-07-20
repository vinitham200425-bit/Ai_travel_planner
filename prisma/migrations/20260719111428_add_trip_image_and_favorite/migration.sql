-- AlterTable
ALTER TABLE "public"."Trip" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false;
