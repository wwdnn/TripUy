import type { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { getGuestId, GUEST_COOKIE_MAX_AGE, GUEST_COOKIE_NAME } from "@/lib/auth/guestSession";
import { fail, handleApiError, ok } from "@/lib/api/response";
import { joinTripSchema } from "@/features/trip/schemas/joinTripSchema";
import { joinTrip } from "@/features/trip/services/joinTrip";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const { inviteCode, guestName } = joinTripSchema.parse(body);

    const user = await getSessionUser();

    if (user) {
      const result = await joinTrip({
        inviteCode,
        userId: user.id,
        userName: user.name,
        guestId: null,
        guestName: null,
      });
      return ok(result, result.alreadyMember ? "Kamu sudah tergabung" : "Berhasil gabung ke trip");
    }

    if (!guestName) {
      return fail(422, "Nama wajib diisi untuk gabung tanpa akun");
    }

    const existingGuestId = await getGuestId();
    const guestId = existingGuestId ?? crypto.randomUUID();

    const result = await joinTrip({
      inviteCode,
      userId: null,
      userName: null,
      guestId,
      guestName,
    });

    const response = ok(
      result,
      result.alreadyMember ? "Kamu sudah tergabung" : "Berhasil gabung sebagai tamu",
    );

    if (!existingGuestId) {
      response.cookies.set(GUEST_COOKIE_NAME, guestId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: GUEST_COOKIE_MAX_AGE,
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
