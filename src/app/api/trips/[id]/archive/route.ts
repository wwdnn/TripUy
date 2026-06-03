import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth/getSessionUser";
import { handleApiError, ok } from "@/lib/api/response";
import { archiveTrip } from "@/features/trip/services/archiveTrip";

const bodySchema = z.object({ status: z.enum(["ACTIVE", "ARCHIVED"]) });

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const { status } = bodySchema.parse(await request.json());
    const trip = await archiveTrip(id, user.id, status);
    return ok(trip, status === "ARCHIVED" ? "Trip diarsipkan" : "Trip diaktifkan kembali");
  } catch (error) {
    return handleApiError(error);
  }
}
