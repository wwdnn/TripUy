import "server-only";
import { prisma } from "@/lib/prisma";
import type { JoinIdentity, TripInvitePreview } from "@/types/trip";
import { TripNotFoundError } from "./errors";

export async function getTripByInviteCode(
  inviteCode: string,
  identity: JoinIdentity,
): Promise<TripInvitePreview> {
  const trip = await prisma.trip.findUnique({
    where: { inviteCode },
    include: {
      createdBy: { select: { name: true } },
      members: { select: { userId: true, guestId: true, guestName: true } },
    },
  });

  if (!trip) throw new TripNotFoundError();

  const currentMember = trip.members.find((member) => {
    if (identity.userId && member.userId === identity.userId) return true;
    if (identity.guestId && member.guestId === identity.guestId) return true;
    return false;
  });

  return {
    id: trip.id,
    name: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    currency: trip.currency,
    status: trip.status as TripInvitePreview["status"],
    memberCount: trip.members.length,
    ownerName: trip.createdBy.name,
    isAlreadyMember: Boolean(currentMember),
    memberName: currentMember?.guestName ?? null,
  };
}
