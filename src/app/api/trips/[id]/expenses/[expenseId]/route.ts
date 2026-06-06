import type { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/getSessionUser";
import { handleApiError, ok } from "@/lib/api/response";
import { updateExpense } from "@/features/expense/services/updateExpense";
import { deleteExpense } from "@/features/expense/services/deleteExpense";
import { updateExpenseSchema } from "@/features/expense/schemas/expenseSchema";

interface RouteContext {
  params: Promise<{ id: string; expenseId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { id, expenseId } = await context.params;
    const body = await request.json();
    const input = updateExpenseSchema.parse(body);

    const expense = await updateExpense(id, expenseId, user.id, input);
    return ok(expense, "Pengeluaran diperbarui");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { id, expenseId } = await context.params;
    await deleteExpense(id, expenseId, user.id);
    return ok(null, "Pengeluaran dihapus");
  } catch (error) {
    return handleApiError(error);
  }
}
