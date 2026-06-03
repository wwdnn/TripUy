import type { CreateTripInput, Trip } from "@/types/trip";
import type { ApiResponse } from "@/lib/api/response";

export async function createTripRequest(input: CreateTripInput): Promise<Trip> {
  const res = await fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as ApiResponse<Trip>;
  if (!json.success || !json.data) throw new Error(json.message);
  return json.data;
}
