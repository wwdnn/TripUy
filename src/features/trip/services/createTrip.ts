import "server-only";
import { prisma } from "@/lib/prisma";
import type { CreateTripInput, Trip } from "@/types/trip";
import { generateInviteCode } from "./generateInviteCode";

export async function createTrip(userId: string, input: CreateTripInput): Promise<Trip> {
  const inviteCode = await generateInviteCode();

  const trip = await prisma.trip.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      currency: input.currency,
      inviteCode,
      createdById: userId,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  return trip as Trip;
}
