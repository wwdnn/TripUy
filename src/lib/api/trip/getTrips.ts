import type { TripListItem, TripStatus } from "@/types/trip";
import type { ApiResponse } from "@/lib/api/response";

export async function getTripsRequest(status?: TripStatus): Promise<TripListItem[]> {
  const query = status ? `?status=${status}` : "";
  const res = await fetch(`/api/trips${query}`);
  const json = (await res.json()) as ApiResponse<TripListItem[]>;
  if (!json.success || !json.data) throw new Error(json.message);
  return json.data;
}
