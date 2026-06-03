import "server-only";
import { prisma } from "@/lib/prisma";
import type { TripListItem, TripRole, TripStatus } from "@/types/trip";

export interface GetTripsByUserIdOptions {
  status?: TripStatus;
}

export async function getTripsByUserId(
  userId: string,
  options?: GetTripsByUserIdOptions,
): Promise<TripListItem[]> {
  const memberships = await prisma.tripMember.findMany({
    where: {
      userId,
      ...(options?.status ? { trip: { status: options.status } } : {}),
    },
    include: {
      trip: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { trip: { updatedAt: "desc" } },
  });

  return memberships.map((m) => {
    const { _count, ...trip } = m.trip;
    return {
      ...trip,
      memberCount: _count.members,
      currentUserRole: m.role as TripRole,
    } satisfies TripListItem;
  });
}
