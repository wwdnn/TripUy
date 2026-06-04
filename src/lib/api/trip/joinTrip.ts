import type { JoinTripResult } from "@/types/trip";
import type { ApiResponse } from "@/lib/api/response";

export interface JoinTripPayload {
  inviteCode: string;
  guestName?: string;
}

export async function joinTripRequest(payload: JoinTripPayload): Promise<JoinTripResult> {
  const res = await fetch("/api/trips/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as ApiResponse<JoinTripResult>;
  if (!json.success || !json.data) throw new Error(json.message);
  return json.data;
}
