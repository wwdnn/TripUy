import type { Trip, TripStatus } from "@/types/trip";
import type { ApiResponse } from "@/lib/api/response";

export async function archiveTripRequest(tripId: string, status: TripStatus): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}/archive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const json = (await res.json()) as ApiResponse<Trip>;
  if (!json.success || !json.data) throw new Error(json.message);
  return json.data;
}
