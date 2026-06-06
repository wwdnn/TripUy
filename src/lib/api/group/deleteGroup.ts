import type { ApiResponse } from "@/lib/api/response";

export async function deleteGroupRequest(tripId: string, groupId: string): Promise<void> {
  const res = await fetch(`/api/trips/${tripId}/groups/${groupId}`, {
    method: "DELETE",
  });
  const json = (await res.json()) as ApiResponse<unknown>;
  if (!json.success) throw new Error(json.message);
}
