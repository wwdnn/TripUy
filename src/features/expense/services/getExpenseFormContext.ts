import "server-only";
import { prisma } from "@/lib/prisma";
import type { ExpenseFormContext } from "@/types/expense";
import { TripNotFoundError } from "@/features/trip/services/errors";
import { memberDisplayName } from "./expenseAccess";

export async function getExpenseFormContext(
  tripId: string,
  userId: string,
): Promise<ExpenseFormContext> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      currency: true,
      members: {
        select: { id: true, userId: true, guestName: true, user: { select: { name: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!trip) throw new TripNotFoundError();

  const currentMember = trip.members.find((m) => m.userId === userId);
  if (!currentMember) throw new TripNotFoundError();

  return {
    tripId,
    currency: trip.currency,
    currentMemberId: currentMember.id,
    members: trip.members.map((m) => ({ id: m.id, name: memberDisplayName(m) })),
  };
}
