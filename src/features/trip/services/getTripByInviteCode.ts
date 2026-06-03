import "server-only";
import { prisma } from "@/lib/prisma";
import type { TripInvitePreview } from "@/types/trip";
import { TripNotFoundError } from "./errors";

export async function getTripByInviteCode(
  inviteCode: string,
  userId: string,
): Promise<TripInvitePreview> {
  const trip = await prisma.trip.findUnique({
    where: { inviteCode },
    include: {
      createdBy: { select: { name: true } },
      members: { select: { userId: true } },
    },
  });

  if (!trip) throw new TripNotFoundError();

  return {
    id: trip.id,
    name: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    currency: trip.currency,
    status: trip.status as TripInvitePreview["status"],
    memberCount: trip.members.length,
    ownerName: trip.createdBy.name,
    isAlreadyMember: trip.members.some((m) => m.userId === userId),
  };
}
