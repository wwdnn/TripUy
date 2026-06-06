import "server-only";
import { prisma } from "@/lib/prisma";
import type { CreateExpenseInput } from "@/types/expense";
import { TripForbiddenError, TripNotFoundError } from "@/features/trip/services/errors";
import { getCurrentMember } from "./expenseAccess";
import { prepareExpenseShares } from "./prepareExpenseShares";






export async function createExpense(
  tripId: string,
  userId: string,
  input: CreateExpenseInput,
): Promise<{ id: string }> {
  const currentMember = await getCurrentMember(tripId, userId);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { currency: true, status: true, members: { select: { id: true } } },
  });
  if (!trip) throw new TripNotFoundError();
  if (trip.status === "ARCHIVED") {
    throw new TripForbiddenError("Trip ini sudah diarsipkan, tidak dapat menambah pengeluaran");
  }

  const memberIds = new Set(trip.members.map((m) => m.id));
  if (!memberIds.has(input.paidById)) {
    throw new TripForbiddenError("Pembayar tidak valid");
  }

  const shares = await prepareExpenseShares(tripId, input.splitType, input.splits, input.amount);

  const expense = await prisma.expense.create({
    data: {
      tripId,
      title: input.title,
      amount: input.amount,
      currency: trip.currency,
      date: input.date,
      category: input.category,
      splitType: input.splitType,
      note: input.note ?? null,
      paidById: input.paidById,
      createdById: currentMember.id,
      shares: { create: shares },
    },
    select: { id: true },
  });

  return expense;
}
