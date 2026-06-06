import "server-only";
import { prisma } from "@/lib/prisma";
import { TripForbiddenError, TripNotFoundError } from "@/features/trip/services/errors";
import { getCurrentMember } from "./expenseAccess";

export async function deleteExpense(
  tripId: string,
  expenseId: string,
  userId: string,
): Promise<void> {
  const currentMember = await getCurrentMember(tripId, userId);

  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, tripId },
    select: { id: true, createdById: true },
  });
  if (!expense) throw new TripNotFoundError();

  const canEdit = expense.createdById === currentMember.id || currentMember.role === "OWNER";
  if (!canEdit) throw new TripForbiddenError("Anda tidak dapat menghapus pengeluaran ini");

  await prisma.expense.delete({ where: { id: expenseId } });
}
