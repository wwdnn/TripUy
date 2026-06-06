import "server-only";
import { prisma } from "@/lib/prisma";
import type { CreateGroupInput } from "@/types/group";
import { assertTripOwner } from "@/features/trip/services/assertTripAccess";
import { assertMembersBelongToTrip } from "./groupAccess";

export async function createGroup(
  tripId: string,
  userId: string,
  input: CreateGroupInput,
): Promise<{ id: string }> {
  await assertTripOwner(tripId, userId);
  await assertMembersBelongToTrip(tripId, input.memberIds);

  return prisma.$transaction(async (tx) => {
    const group = await tx.memberGroup.create({
      data: { tripId, name: input.name },
      select: { id: true },
    });
    if (input.memberIds.length > 0) {
      await tx.tripMember.updateMany({
        where: { id: { in: input.memberIds }, tripId },
        data: { groupId: group.id },
      });
    }
    return group;
  });
}
