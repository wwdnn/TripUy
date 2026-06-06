import "server-only";
import { prisma } from "@/lib/prisma";
import type { ExpenseCategory, ExpenseListItem } from "@/types/expense";
import { getCurrentMember, memberDisplayName } from "./expenseAccess";

export async function getExpensesByTripId(
  tripId: string,
  userId: string,
): Promise<ExpenseListItem[]> {
  await getCurrentMember(tripId, userId);

  const expenses = await prisma.expense.findMany({
    where: { tripId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      paidBy: { select: { guestName: true, user: { select: { name: true } } } },
      _count: { select: { shares: true } },
    },
  });

  return expenses.map((e) => ({
    id: e.id,
    tripId: e.tripId,
    title: e.title,
    amount: e.amount,
    currency: e.currency,
    date: e.date,
    category: e.category as ExpenseCategory,
    note: e.note,
    paidById: e.paidById,
    createdById: e.createdById,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    paidByName: memberDisplayName(e.paidBy),
    participantCount: e._count.shares,
  }));
}
