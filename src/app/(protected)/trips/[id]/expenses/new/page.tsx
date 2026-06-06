import Link from "next/link";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { ExpenseForm } from "@/features/expense/components/ExpenseForm";
import { getExpenseFormContext } from "@/features/expense/services/getExpenseFormContext";
import { TripNotFoundError } from "@/features/trip/services/errors";
import { requireSessionUser } from "@/lib/auth/getSessionUser";

interface NewExpensePageProps {
  params: Promise<{ id: string }>;
}

export default async function NewExpensePage({ params }: NewExpensePageProps): Promise<JSX.Element> {
  const user = await requireSessionUser();
  const { id } = await params;

  const context = await getExpenseFormContext(id, user.id).catch((error) => {
    if (error instanceof TripNotFoundError) notFound();
    throw error;
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <Link href={`/trips/${id}`} className="text-muted-foreground text-sm hover:underline">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-semibold">Tambah pengeluaran</h1>
      </header>

      <ExpenseForm mode="create" context={context} />
    </main>
  );
}
