-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('FOOD', 'TRANSPORT', 'LODGING', 'ACTIVITY', 'SHOPPING', 'OTHER');

-- DropForeignKey
ALTER TABLE "trip_member" DROP CONSTRAINT "trip_member_userId_fkey";

-- CreateTable
CREATE TABLE "expense" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" "ExpenseCategory" NOT NULL DEFAULT 'OTHER',
    "note" TEXT,
    "paidById" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_share" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "expense_share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_tripId_idx" ON "expense"("tripId");

-- CreateIndex
CREATE INDEX "expense_paidById_idx" ON "expense"("paidById");

-- CreateIndex
CREATE INDEX "expense_share_memberId_idx" ON "expense_share"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_share_expenseId_memberId_key" ON "expense_share"("expenseId", "memberId");

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "trip_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "trip_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_share" ADD CONSTRAINT "expense_share_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_share" ADD CONSTRAINT "expense_share_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "trip_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_member" ADD CONSTRAINT "trip_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
