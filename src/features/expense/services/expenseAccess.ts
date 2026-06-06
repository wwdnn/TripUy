import "server-only";
import { prisma } from "@/lib/prisma";
import type { TripRole } from "@/types/trip";
import { TripNotFoundError } from "@/features/trip/services/errors";

export interface CurrentMember {
  id: string;
  role: TripRole;
}

export function memberDisplayName(member: {
  guestName: string | null;
  user: { name: string } | null;
}): string {
  return member.user?.name ?? member.guestName ?? "Tamu";
}

export async function getCurrentMember(tripId: string, userId: string): Promise<CurrentMember> {
  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId } },
    select: { id: true, role: true },
  });
  if (!member) throw new TripNotFoundError();
  return { id: member.id, role: member.role as TripRole };
}
