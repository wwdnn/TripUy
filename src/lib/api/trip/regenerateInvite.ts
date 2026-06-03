import type { Trip } from "@/types/trip";
import type { ApiResponse } from "@/lib/api/response";

export async function regenerateInviteRequest(tripId: string): Promise<Trip> {
  const res = await fetch(`/api/trips/${tripId}/invite`, { method: "POST" });
  const json = (await res.json()) as ApiResponse<Trip>;
  if (!json.success || !json.data) throw new Error(json.message);
  return json.data;
}
