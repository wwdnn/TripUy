import type { ApiResponse } from "@/lib/api/response";

export async function deleteTripRequest(tripId: string): Promise<void> {
  const res = await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
  const json = (await res.json()) as ApiResponse<null>;
  if (!json.success) throw new Error(json.message);
}
