import type { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/getSessionUser";
import { created, handleApiError } from "@/lib/api/response";
import { createExpense } from "@/features/expense/services/createExpense";
import { createExpenseSchema } from "@/features/expense/schemas/expenseSchema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const body = await request.json();
    const input = createExpenseSchema.parse(body);

    const expense = await createExpense(id, user.id, input);
    return created(expense, "Pengeluaran ditambahkan");
  } catch (error) {
    return handleApiError(error);
  }
}
