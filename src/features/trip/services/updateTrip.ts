import "server-only";
import { prisma } from "@/lib/prisma";
import type { Trip, UpdateTripInput } from "@/types/trip";
import { assertTripOwner } from "./assertTripAccess";

export async function updateTrip(
  tripId: string,
  userId: string,
  input: UpdateTripInput,
): Promise<Trip> {
  await assertTripOwner(tripId, userId);

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description ?? null } : {}),
      ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
      ...(input.endDate !== undefined ? { endDate: input.endDate ?? null } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
    },
  });

  return trip as Trip;
}
