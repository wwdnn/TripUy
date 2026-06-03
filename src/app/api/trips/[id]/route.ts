import type { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/getSessionUser";
import { handleApiError, ok } from "@/lib/api/response";
import { getTripById } from "@/features/trip/services/getTripById";
import { updateTrip } from "@/features/trip/services/updateTrip";
import { deleteTrip } from "@/features/trip/services/deleteTrip";
import { updateTripSchema } from "@/features/trip/schemas/tripSchema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const trip = await getTripById(id, user.id);
    return ok(trip);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const body = await request.json();
    const input = updateTripSchema.parse(body);
    const trip = await updateTrip(id, user.id, input);
    return ok(trip, "Trip berhasil diperbarui");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    await deleteTrip(id, user.id);
    return ok(null, "Trip telah dihapus");
  } catch (error) {
    return handleApiError(error);
  }
}
