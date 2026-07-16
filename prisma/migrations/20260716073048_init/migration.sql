-- CreateTable
CREATE TABLE "public"."Trip" (
    "id" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "budget" INTEGER NOT NULL,
    "travelers" TEXT NOT NULL,
    "travelStyle" TEXT NOT NULL,
    "hotelCategory" TEXT NOT NULL,
    "itinerary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);
