import type { ApiResponse } from "@/lib/api/response";

export async function deleteExpenseRequest(tripId: string, expenseId: string): Promise<void> {
  const res = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
    method: "DELETE",
  });
  
  const json = (await res.json()) as ApiResponse<null>;
  if (!json.success) throw new Error(json.message);
}
