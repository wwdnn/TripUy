import Link from "next/link";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { DeleteExpenseButton } from "@/features/expense/components/DeleteExpenseButton";
import { categoryLabel } from "@/features/expense/categories";
import { getExpenseById } from "@/features/expense/services/getExpenseById";
import { TripNotFoundError } from "@/features/trip/services/errors";
import { requireSessionUser } from "@/lib/auth/getSessionUser";
import { formatDate, formatMoney } from "@/lib/utils";
import type { SplitType } from "@/types/expense";

interface ExpenseDetailPageProps {
  params: Promise<{ id: string; expenseId: string }>;
}

const SPLIT_TYPE_LABELS: Record<SplitType, string> = {
  EQUAL: "Dibagi rata",
  EXACT: "Nominal pasti",
  PERCENTAGE: "Persentase",
  SHARE: "Bobot",
};

function splitTypeLabel(splitType: SplitType): string {
  return SPLIT_TYPE_LABELS[splitType];
}

function shareValueHint(splitType: SplitType, splitValue: number | null): string | null {
  if (splitValue == null) return null;
  if (splitType === "PERCENTAGE") return `${splitValue / 100}%`;
  if (splitType === "SHARE") return `bobot ${splitValue}`;
  return null;
}

export default async function ExpenseDetailPage({
  params,
}: ExpenseDetailPageProps): Promise<JSX.Element> {
  const user = await requireSessionUser();
  const { id, expenseId } = await params;

  const expense = await getExpenseById(id, expenseId, user.id).catch((error) => {
    if (error instanceof TripNotFoundError) notFound();
    throw error;
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <Link href={`/trips/${id}`} className="text-muted-foreground text-sm hover:underline">
        ← Kembali
      </Link>

      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-sm">{categoryLabel(expense.category)}</span>
        <h1 className="text-2xl font-semibold">{expense.title}</h1>
        <p className="text-xl font-semibold">{formatMoney(expense.amount, expense.currency)}</p>
        <p className="text-muted-foreground text-sm">
          Dibayar oleh {expense.paidByName} • {formatDate(expense.date)}
        </p>
      </header>

      {expense.note ? (
        <p className="border-border bg-card rounded-xl border p-4 text-sm">{expense.note}</p>
      ) : null}

      <section className="border-border bg-card rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Pembagian</h2>
          <span className="text-muted-foreground text-xs">{splitTypeLabel(expense.splitType)}</span>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {expense.shares.map((share) => (
            <li key={share.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {share.name}
                {share.type === "group" ? (
                  <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                    Grup
                  </span>
                ) : null}
                {shareValueHint(expense.splitType, share.splitValue) ? (
                  <span className="text-muted-foreground text-xs">
                    {shareValueHint(expense.splitType, share.splitValue)}
                  </span>
                ) : null}
              </span>
              <span className="font-medium">{formatMoney(share.amount, expense.currency)}</span>
            </li>
          ))}
        </ul>
      </section>

      {expense.canEdit ? (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DeleteExpenseButton tripId={id} expenseId={expense.id} />
          <Link
            href={`/trips/${id}/expenses/${expense.id}/edit`}
            className="border-input flex h-11 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
          >
            Edit
          </Link>
        </div>
      ) : null}
    </main>
  );
}
