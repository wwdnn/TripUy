import type { UpdateGroupInput } from "@/types/group";
import type { ApiResponse } from "@/lib/api/response";

export async function updateGroupRequest(
  tripId: string,
  groupId: string,
  input: UpdateGroupInput,
): Promise<void> {
  const res = await fetch(`/api/trips/${tripId}/groups/${groupId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as ApiResponse<unknown>;
  if (!json.success) throw new Error(json.message);
}
