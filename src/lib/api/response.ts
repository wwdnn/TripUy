import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { TripAuthError } from "@/lib/auth/getSessionUser";
import { TripForbiddenError, TripNotFoundError } from "@/features/trip/services/errors";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

export function ok<T>(data: T, message = "OK"): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message });
}

export function created<T>(data: T, message = "Berhasil dibuat"): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status: 201 });
}

export function fail(status: number, message: string): NextResponse<ApiResponse<null>> {
  return NextResponse.json({ success: false, data: null, message }, { status });
}

export function handleApiError(error: unknown): NextResponse<ApiResponse<null>> {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return fail(422, first?.message ?? "Data tidak valid");
  }
  if (error instanceof TripAuthError) return fail(401, "Silakan masuk terlebih dahulu");
  if (error instanceof TripForbiddenError) return fail(403, error.message);
  if (error instanceof TripNotFoundError) return fail(404, error.message);

  console.error("[api] unhandled error", error);
  return fail(500, "Terjadi kesalahan, coba lagi");
}
