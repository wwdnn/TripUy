import "server-only";
import { prisma } from "@/lib/prisma";
import type { TripGroupData } from "@/types/group";
import { TripNotFoundError } from "@/features/trip/services/errors";

function displayName(member: {
  guestName: string | null;
  user: { name: string } | null;
}): string {
  return member.user?.name ?? member.guestName ?? "Tamu";
}

export async function getTripGroups(tripId: string, userId: string): Promise<TripGroupData> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      members: {
        select: {
          id: true,
          userId: true,
          guestName: true,
          groupId: true,
          role: true,
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

  const members = trip.members.map((m) => ({
    id: m.id,
    name: displayName(m),
    groupId: m.groupId,
  }));

  const groups = trip.groups.map((g) => ({
    id: g.id,
    name: g.name,
    members: members.filter((m) => m.groupId === g.id),
  }));

  return { groups, members, isOwner: currentMember.role === "OWNER" };
}
