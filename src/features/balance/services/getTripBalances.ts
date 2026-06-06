import "server-only";
import { prisma } from "@/lib/prisma";
import type { TripBalanceSummary } from "@/types/balance";
import { getCurrentMember, memberDisplayName } from "@/features/expense/services/expenseAccess";
import { TripNotFoundError } from "@/features/trip/services/errors";
import { calculateBalances } from "./calculateBalances";

export async function getTripBalances(
  tripId: string,
  userId: string,
): Promise<TripBalanceSummary> {
  await getCurrentMember(tripId, userId);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      currency: true,
      members: {
        select: {
          id: true,
          groupId: true,
          guestName: true,
          user: { select: { name: true } },
        },
      },
      groups: { select: { id: true, name: true } },
      expenses: {
        select: {
          amount: true,
          paidById: true,
          shares: { select: { amount: true, memberId: true, groupId: true } },
        },
      },
    },
  });

  if (!trip) throw new TripNotFoundError();

  const members = trip.members.map((m) => ({
    id: m.id,
    displayName: memberDisplayName(m),
    isGuest: m.user === null,
    groupId: m.groupId,
  }));

  const units = calculateBalances(members, trip.groups, trip.expenses);
  const totalExpense = trip.expenses.reduce((acc, e) => acc + e.amount, 0);

  return { currency: trip.currency, totalExpense, units };
}
