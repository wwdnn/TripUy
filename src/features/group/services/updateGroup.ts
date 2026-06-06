import "server-only";
import { prisma } from "@/lib/prisma";
import type { UpdateGroupInput } from "@/types/group";
import { assertTripOwner } from "@/features/trip/services/assertTripAccess";
import { assertGroupInTrip, assertMembersBelongToTrip } from "./groupAccess";

export async function updateGroup(
  tripId: string,
  groupId: string,
  userId: string,
  input: UpdateGroupInput,
): Promise<{ id: string }> {
  await assertTripOwner(tripId, userId);
  await assertGroupInTrip(tripId, groupId);
  if (input.memberIds) await assertMembersBelongToTrip(tripId, input.memberIds);

  await prisma.$transaction(async (tx) => {
    if (input.name !== undefined) {
      await tx.memberGroup.update({ where: { id: groupId }, data: { name: input.name } });
    }
    if (input.memberIds) {
      await tx.tripMember.updateMany({ where: { tripId, groupId }, data: { groupId: null } });
      if (input.memberIds.length > 0) {
        await tx.tripMember.updateMany({
          where: { tripId, id: { in: input.memberIds } },
          data: { groupId },
        });
      }
    }
  });

  return { id: groupId };
}
