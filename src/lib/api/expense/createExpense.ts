import type { CreateExpenseInput } from "@/types/expense";
import type { ApiResponse } from "@/lib/api/response";

export async function createExpenseRequest(
  tripId: string,
  input: CreateExpenseInput,
): Promise<{ id: string }> {
  const res = await fetch(`/api/trips/${tripId}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as ApiResponse<{ id: string }>;
  if (!json.success || !json.data) throw new Error(json.message);
  return json.data;
}
