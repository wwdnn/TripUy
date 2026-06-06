-- CreateEnum
CREATE TYPE "SplitType" AS ENUM ('EQUAL', 'EXACT', 'PERCENTAGE', 'SHARE');

-- AlterTable
ALTER TABLE "expense" ADD COLUMN     "splitType" "SplitType" NOT NULL DEFAULT 'EQUAL';

-- AlterTable
ALTER TABLE "expense_share" ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "splitValue" INTEGER,
ALTER COLUMN "memberId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "expense_share_expenseId_groupId_key" ON "expense_share"("expenseId", "groupId");

-- CreateIndex
CREATE INDEX "expense_share_groupId_idx" ON "expense_share"("groupId");

-- AddForeignKey
ALTER TABLE "expense_share" ADD CONSTRAINT "expense_share_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "member_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
