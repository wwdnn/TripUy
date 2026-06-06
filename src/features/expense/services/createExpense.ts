import "server-only";
import { prisma } from "@/lib/prisma";
import type { CreateExpenseInput } from "@/types/expense";
import { TripForbiddenError, TripNotFoundError } from "@/features/trip/services/errors";
import { calculateEqualShares } from "./calculateEqualShares";
import { getCurrentMember } from "./expenseAccess";

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
  const isValidMembers =
    memberIds.has(input.paidById) && input.participantIds.every((id) => memberIds.has(id));
  if (!isValidMembers) {
    throw new TripForbiddenError("Pembayar atau peserta tidak valid");
  }

  const shares = calculateEqualShares(input.amount, input.participantIds);

  const expense = await prisma.expense.create({
    data: {
      tripId,
      title: input.title,
      amount: input.amount,
      currency: trip.currency,
      date: input.date,
      category: input.category,
      note: input.note ?? null,
      paidById: input.paidById,
      createdById: currentMember.id,
      shares: { create: shares },
    },
    select: { id: true },
  });

  return expense;
}
