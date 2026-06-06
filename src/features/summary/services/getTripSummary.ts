import "server-only";
import { prisma } from "@/lib/prisma";
import type { TripBalanceSummary } from "@/types/balance";
import type { ExpenseCategory, SplitType } from "@/types/expense";
import type { TripSettlementSummary } from "@/types/settlement";
import type { TripSummary } from "@/types/summary";
import { getTripBalances } from "@/features/balance/services/getTripBalances";
import { getCurrentMember } from "@/features/expense/services/expenseAccess";
import { getTripSettlement } from "@/features/settlement/services/getTripSettlement";
import { TripNotFoundError } from "@/features/trip/services/errors";
import { calculateTripSummary } from "./calculateTripSummary";

interface GetTripSummaryOptions {
  balances?: TripBalanceSummary;
  settlement?: TripSettlementSummary;
}

export async function getTripSummary(
  tripId: string,
  userId: string,
  options: GetTripSummaryOptions = {},
): Promise<TripSummary> {
  await getCurrentMember(tripId, userId);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      currency: true,
      status: true,
      startDate: true,
      endDate: true,
      _count: { select: { members: true, groups: true } },
      expenses: {
        select: {
          id: true,
          title: true,
          amount: true,
          date: true,
          category: true,
          splitType: true,
        },
      },
    },
  });

  if (!trip) throw new TripNotFoundError();

  const balances = options.balances ?? (await getTripBalances(tripId, userId));
  const settlement = options.settlement ?? (await getTripSettlement(tripId, userId));

  return calculateTripSummary({
    trip: {
      currency: trip.currency,
      status: trip.status,
      startDate: trip.startDate,
      endDate: trip.endDate,
    },
    memberCount: trip._count.members,
    groupCount: trip._count.groups,
    expenses: trip.expenses.map((expense) => ({
      ...expense,
      category: expense.category as ExpenseCategory,
      splitType: expense.splitType as SplitType,
    })),
    balances,
    settlement,
  });
}
