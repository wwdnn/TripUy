import "server-only";
import { prisma } from "@/lib/prisma";
import { TripForbiddenError, TripNotFoundError } from "@/features/trip/services/errors";

export async function assertMembersBelongToTrip(
  tripId: string,
  memberIds: string[],
): Promise<void> {
  const uniqueIds = [...new Set(memberIds)];
  if (uniqueIds.length === 0) return;

  const count = await prisma.tripMember.count({
    where: { tripId, id: { in: uniqueIds } },
  });
  if (count !== uniqueIds.length) {
    throw new TripForbiddenError("Sebagian anggota tidak valid");
  }
}

export async function assertGroupInTrip(tripId: string, groupId: string): Promise<void> {
  const group = await prisma.memberGroup.findFirst({
    where: { id: groupId, tripId },
    select: { id: true },
  });
  if (!group) throw new TripNotFoundError();
}
