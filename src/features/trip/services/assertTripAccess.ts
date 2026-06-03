import "server-only";
import { prisma } from "@/lib/prisma";
import type { TripRole } from "@/types/trip";
import { TripForbiddenError, TripNotFoundError } from "./errors";

export async function assertTripMember(tripId: string, userId: string): Promise<TripRole> {
  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId } },
    select: { role: true },
  });
  if (!member) throw new TripNotFoundError();
  return member.role as TripRole;
}

export async function assertTripOwner(tripId: string, userId: string): Promise<void> {
  const role = await assertTripMember(tripId, userId);
  if (role !== "OWNER") {
    throw new TripForbiddenError("Hanya pemilik trip yang dapat melakukan aksi ini");
  }
}
