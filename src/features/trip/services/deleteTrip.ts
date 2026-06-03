import "server-only";
import { prisma } from "@/lib/prisma";
import { assertTripOwner } from "./assertTripAccess";

export async function deleteTrip(tripId: string, userId: string): Promise<void> {
  await assertTripOwner(tripId, userId);
  await prisma.trip.delete({ where: { id: tripId } });
}
