import Link from "next/link";
import type { JSX } from "react";
import { categoryLabel } from "@/features/expense/categories";
import { formatDate, formatMoney } from "@/lib/utils";
import type { ExpenseListItem } from "@/types/expense";

interface ExpenseSectionProps {
  tripId: string;
  expenses: ExpenseListItem[];
}

export function ExpenseSection({ tripId, expenses }: ExpenseSectionProps): JSX.Element {
  return (
    <section className="border-border bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Pengeluaran</h2>
        <Link
          href={`/trips/${tripId}/expenses/new`}
          className="bg-primary text-primary-foreground flex h-9 items-center rounded-md px-3 text-sm font-medium hover:opacity-90"
        >
          + Tambah
        </Link>
      </div>

      {expenses.length === 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Belum ada pengeluaran. Tambahkan pengeluaran pertama trip ini.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {expenses.map((expense) => (
            <li key={expense.id}>
              <Link
                href={`/trips/${tripId}/expenses/${expense.id}`}
                className="border-border hover:bg-muted flex flex-col gap-1 rounded-lg border p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{expense.title}</span>
                  <span className="font-semibold">
                    {formatMoney(expense.amount, expense.currency)}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span>{categoryLabel(expense.category)}</span>
                  <span>•</span>
                  <span>Dibayar {expense.paidByName}</span>
                  <span>•</span>
                  <span>{formatDate(expense.date)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
