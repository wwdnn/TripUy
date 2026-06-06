import "server-only";
import { prisma } from "@/lib/prisma";
import type { ExpenseCategory, ExpenseDetail, ExpenseShareUnit, SplitType } from "@/types/expense";
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
          group: { select: { name: true } },
        },
      },
    },
  });

  if (!expense) throw new TripNotFoundError();

  const canEdit = expense.createdById === currentMember.id || currentMember.role === "OWNER";

  const shares: ExpenseShareUnit[] = expense.shares.map((share) => {
    if (share.groupId) {
      return {
        id: share.id,
        type: "group",
        refId: share.groupId,
        name: share.group?.name ?? "Grup",
        amount: share.amount,
        splitValue: share.splitValue,
      };
    }
    return {
      id: share.id,
      type: "member",
      refId: share.memberId ?? "",
      name: share.member ? memberDisplayName(share.member) : "Tamu",
      amount: share.amount,
      splitValue: share.splitValue,
    };
  });

  return {
    id: expense.id,
    tripId: expense.tripId,
    title: expense.title,
    amount: expense.amount,
    currency: expense.currency,
    date: expense.date,
    category: expense.category as ExpenseCategory,
    splitType: expense.splitType as SplitType,
    note: expense.note,
    paidById: expense.paidById,
    createdById: expense.createdById,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
    paidByName: memberDisplayName(expense.paidBy),
    canEdit,
    shares,
  };
}
