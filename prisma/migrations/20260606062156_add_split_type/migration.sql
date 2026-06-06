-- DropForeignKey
ALTER TABLE "expense_share" DROP CONSTRAINT "expense_share_memberId_fkey";

-- AddForeignKey
ALTER TABLE "expense_share" ADD CONSTRAINT "expense_share_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "trip_member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
