import "server-only";
import { prisma } from "@/lib/prisma";
import type { ExpenseCategory, ExpenseDetail } from "@/types/expense";
import { TripNotFoundError } from "@/features/trip/services/errors";
import { getCurrentMember, memberDisplayName } from "./expenseAccess";

export async function getExpenseById(
  tripId: string,
  expenseId: string,
  userId: string,
): Promise<ExpenseDetail> {
  const currentMember = await getCurrentMember(tripId, userId);

  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, tripId },
    include: {
      paidBy: { select: { guestName: true, user: { select: { name: true } } } },
      shares: {
        include: {
          member: { select: { guestName: true, user: { select: { name: true } } } },
        },
      },
    },
  });

  if (!expense) throw new TripNotFoundError();

  const canEdit = expense.createdById === currentMember.id || currentMember.role === "OWNER";

  return {
    id: expense.id,
    tripId: expense.tripId,
    title: expense.title,
    amount: expense.amount,
    currency: expense.currency,
    date: expense.date,
    category: expense.category as ExpenseCategory,
    note: expense.note,
    paidById: expense.paidById,
    createdById: expense.createdById,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
    paidByName: memberDisplayName(expense.paidBy),
    canEdit,
    shares: expense.shares.map((s) => ({
      id: s.id,
      expenseId: s.expenseId,
      memberId: s.memberId,
      amount: s.amount,
      memberName: memberDisplayName(s.member),
    })),
  };
}
