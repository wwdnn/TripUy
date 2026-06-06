-- AlterTable
ALTER TABLE "trip_member" ADD COLUMN     "groupId" TEXT;

-- CreateTable
CREATE TABLE "member_group" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "member_group_tripId_idx" ON "member_group"("tripId");

-- CreateIndex
CREATE INDEX "trip_member_groupId_idx" ON "trip_member"("groupId");

-- AddForeignKey
ALTER TABLE "member_group" ADD CONSTRAINT "member_group_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_member" ADD CONSTRAINT "trip_member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "member_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
