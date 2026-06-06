import "server-only";
import { prisma } from "@/lib/prisma";
import { assertTripOwner } from "@/features/trip/services/assertTripAccess";
import { assertGroupInTrip } from "./groupAccess";

export async function deleteGroup(
  tripId: string,
  groupId: string,
  userId: string,
): Promise<void> {
  await assertTripOwner(tripId, userId);
  await assertGroupInTrip(tripId, groupId);
  await prisma.memberGroup.delete({ where: { id: groupId } });
}
