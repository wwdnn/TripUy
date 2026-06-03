import "server-only";
import { prisma } from "@/lib/prisma";
import type { Trip, TripStatus } from "@/types/trip";
import { assertTripOwner } from "./assertTripAccess";



export async function archiveTrip(
  tripId: string,
  userId: string,
  status: TripStatus,
): Promise<Trip> {
  await assertTripOwner(tripId, userId);
  const trip = await prisma.trip.update({ where: { id: tripId }, data: { status } });
  return trip as Trip;
}
