import "server-only";
import { prisma } from "@/lib/prisma";
import type { ExpenseFormContext, ExpenseUnitOption } from "@/types/expense";
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
        select: {
          id: true,
          userId: true,
          guestName: true,
          groupId: true,
          user: { select: { name: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
      groups: {
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!trip) throw new TripNotFoundError();

  const currentMember = trip.members.find((m) => m.userId === userId);
  if (!currentMember) throw new TripNotFoundError();

  const groupedMemberCount = new Map<string, number>();
  for (const member of trip.members) {
    if (member.groupId) {
      groupedMemberCount.set(member.groupId, (groupedMemberCount.get(member.groupId) ?? 0) + 1);
    }
  }

  const memberUnits: ExpenseUnitOption[] = trip.members
    .filter((m) => !m.groupId)
    .map((m) => ({ type: "member", refId: m.id, name: memberDisplayName(m) }));

  const groupUnits: ExpenseUnitOption[] = trip.groups
    .filter((g) => (groupedMemberCount.get(g.id) ?? 0) > 0)
    .map((g) => ({ type: "group", refId: g.id, name: g.name }));

  return {
    tripId,
    currency: trip.currency,
    currentMemberId: currentMember.id,
    members: trip.members.map((m) => ({ id: m.id, name: memberDisplayName(m) })),
    units: [...memberUnits, ...groupUnits],
  };
}
