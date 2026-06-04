import "server-only";
import { prisma } from "@/lib/prisma";
import type { JoinTripResult } from "@/types/trip";
import { TripForbiddenError, TripNotFoundError } from "./errors";

interface JoinTripParams {
  inviteCode: string;
  userId: string | null;
  userName: string | null;
  guestId: string | null;
  guestName: string | null;
}

export async function joinTrip(params: JoinTripParams): Promise<JoinTripResult> {
  const { inviteCode, userId, userName, guestId, guestName } = params;
  const isGuest = !userId;

  if (isGuest && (!guestId || !guestName)) {
    throw new TripForbiddenError("Nama tamu wajib diisi untuk gabung tanpa akun");
  }

  const trip = await prisma.trip.findUnique({
    where: { inviteCode },
    select: { id: true, status: true },
  });

  if (!trip) throw new TripNotFoundError();
  if (trip.status === "ARCHIVED") {
    throw new TripForbiddenError("Trip ini sudah diarsipkan, tidak bisa digabungi");
  }

  const existing = await prisma.tripMember.findFirst({
    where: {
      tripId: trip.id,
      ...(isGuest ? { guestId } : { userId }),
    },
    select: { guestName: true },
  });

  if (existing) {
    return {
      tripId: trip.id,
      memberName: isGuest ? (existing.guestName ?? guestName ?? "Tamu") : (userName ?? "Anggota"),
      isGuest,
      alreadyMember: true,
    };
  }

  await prisma.tripMember.create({
    data: {
      tripId: trip.id,
      role: "MEMBER",
      userId: isGuest ? null : userId,
      guestId: isGuest ? guestId : null,
      guestName: isGuest ? guestName : null,
    },
  });

  return {
    tripId: trip.id,
    memberName: isGuest ? (guestName ?? "Tamu") : (userName ?? "Anggota"),
    isGuest,
    alreadyMember: false,
  };
}
