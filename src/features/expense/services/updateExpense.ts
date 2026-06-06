import "server-only";
import { prisma } from "@/lib/prisma";
import type { UpdateExpenseInput } from "@/types/expense";
import { TripForbiddenError, TripNotFoundError } from "@/features/trip/services/errors";
import { calculateEqualShares } from "./calculateEqualShares";
import { getCurrentMember } from "./expenseAccess";

export async function updateExpense(
  tripId: string,
  expenseId: string,
  userId: string,
  input: UpdateExpenseInput,
): Promise<{ id: string }> {
  const currentMember = await getCurrentMember(tripId, userId);

  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, tripId },
    select: { id: true, createdById: true },
  });
  if (!expense) throw new TripNotFoundError();

  const canEdit = expense.createdById === currentMember.id || currentMember.role === "OWNER";
  if (!canEdit) throw new TripForbiddenError("Anda tidak dapat mengubah pengeluaran ini");

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { status: true, members: { select: { id: true } } },
  });
  if (!trip) throw new TripNotFoundError();
  if (trip.status === "ARCHIVED") {
    throw new TripForbiddenError("Trip ini sudah diarsipkan, tidak dapat mengubah pengeluaran");
  }

  const memberIds = new Set(trip.members.map((m) => m.id));
  const isValidMembers =
    memberIds.has(input.paidById) && input.participantIds.every((id) => memberIds.has(id));
  if (!isValidMembers) {
    throw new TripForbiddenError("Pembayar atau peserta tidak valid");
  }

  const shares = calculateEqualShares(input.amount, input.participantIds);

  await prisma.$transaction([
    prisma.expenseShare.deleteMany({ where: { expenseId } }),
    prisma.expense.update({
      where: { id: expenseId },
      data: {
        title: input.title,
        amount: input.amount,
        date: input.date,
        category: input.category,
        note: input.note ?? null,
        paidById: input.paidById,
        shares: { create: shares },
      },
    }),
  ]);

  return { id: expenseId };
}
