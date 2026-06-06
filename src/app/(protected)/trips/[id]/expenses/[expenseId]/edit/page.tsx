import Link from "next/link";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { ExpenseForm } from "@/features/expense/components/ExpenseForm";
import { getExpenseById } from "@/features/expense/services/getExpenseById";
import { getExpenseFormContext } from "@/features/expense/services/getExpenseFormContext";
import { TripForbiddenError, TripNotFoundError } from "@/features/trip/services/errors";
import { requireSessionUser } from "@/lib/auth/getSessionUser";

interface EditExpensePageProps {
  params: Promise<{ id: string; expenseId: string }>;
}

export default async function EditExpensePage({
  params,
}: EditExpensePageProps): Promise<JSX.Element> {
  const user = await requireSessionUser();
  const { id, expenseId } = await params;

  const [context, expense] = await Promise.all([
    getExpenseFormContext(id, user.id),
    getExpenseById(id, expenseId, user.id),
  ]).catch((error) => {
    if (error instanceof TripNotFoundError) notFound();
    throw error;
  });

  if (!expense.canEdit) throw new TripForbiddenError("Anda tidak dapat mengubah pengeluaran ini");

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <Link
          href={`/trips/${id}/expenses/${expenseId}`}
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Kembali
        </Link>
        <h1 className="text-2xl font-semibold">Edit pengeluaran</h1>
      </header>

      <ExpenseForm mode="edit" context={context} expenseId={expenseId} initialData={expense} />
    </main>
  );
}
