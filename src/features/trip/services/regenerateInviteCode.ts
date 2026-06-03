import "server-only";
import { prisma } from "@/lib/prisma";
import type { Trip } from "@/types/trip";
import { assertTripOwner } from "./assertTripAccess";
import { generateInviteCode } from "./generateInviteCode";

export async function regenerateInviteCode(tripId: string, userId: string): Promise<Trip> {
  await assertTripOwner(tripId, userId);
  const inviteCode = await generateInviteCode();
  const trip = await prisma.trip.update({ where: { id: tripId }, data: { inviteCode } });
  return trip as Trip;
}
