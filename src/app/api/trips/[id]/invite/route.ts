import type { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/getSessionUser";
import { handleApiError, ok } from "@/lib/api/response";
import { regenerateInviteCode } from "@/features/trip/services/regenerateInviteCode";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const trip = await regenerateInviteCode(id, user.id);
    return ok(trip, "Kode invite diperbarui");
  } catch (error) {
    return handleApiError(error);
  }
}
