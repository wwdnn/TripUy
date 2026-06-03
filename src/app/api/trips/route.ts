import type { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/getSessionUser";
import { created, handleApiError, ok } from "@/lib/api/response";
import { createTrip } from "@/features/trip/services/createTrip";
import { getTripsByUserId } from "@/features/trip/services/getTripsByUserId";
import { createTripSchema } from "@/features/trip/schemas/tripSchema";
import type { TripStatus } from "@/types/trip";



export async function GET(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const statusParam = request.nextUrl.searchParams.get("status");
    const status: TripStatus | undefined = statusParam === "ACTIVE" || statusParam === "ARCHIVED" ? statusParam : undefined;

    const trips = await getTripsByUserId(user.id, { status });
    return ok(trips);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const input = createTripSchema.parse(body);
    
    const trip = await createTrip(user.id, input);
    return created(trip, "Trip berhasil dibuat");
  } catch (error) {
    return handleApiError(error);
  }
}
