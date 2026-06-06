import type { UpdateExpenseInput } from "@/types/expense";
import type { ApiResponse } from "@/lib/api/response";

export async function updateExpenseRequest(
  tripId: string,
  expenseId: string,
  input: UpdateExpenseInput,
): Promise<{ id: string }> {
  const res = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as ApiResponse<{ id: string }>;
  if (!json.success || !json.data) throw new Error(json.message);
  return json.data;
}
