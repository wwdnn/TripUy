-- AlterTable
ALTER TABLE "trip_member" ALTER COLUMN "userId" DROP NOT NULL,
ADD COLUMN     "guestId" TEXT,
ADD COLUMN     "guestName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "trip_member_tripId_guestId_key" ON "trip_member"("tripId", "guestId");
