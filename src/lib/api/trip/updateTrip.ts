import type { Trip, UpdateTripInput } from "@/types/trip";
import type { ApiResponse } from "@/lib/api/response";

export async function updateTripRequest(tripId: string, input: UpdateTripInput): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as ApiResponse<Trip>;
  if (!json.success || !json.data) throw new Error(json.message);
  return json.data;
}
