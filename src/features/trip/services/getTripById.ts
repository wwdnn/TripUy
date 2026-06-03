import "server-only";
import { prisma } from "@/lib/prisma";
import type { TripWithMembers } from "@/types/trip";
import { TripNotFoundError } from "./errors";





export async function getTripById(tripId: string, userId: string): Promise<TripWithMembers> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { members: true },
  });

  if (!trip) throw new TripNotFoundError();

  const isMember = trip.members.some((m) => m.userId === userId);
  if (!isMember) throw new TripNotFoundError();

  return trip as TripWithMembers;
}
