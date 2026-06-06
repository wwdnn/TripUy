import type { JSX } from "react";
import { formatMoney } from "@/lib/utils";
import type { TripSettlementSummary } from "@/types/settlement";

interface SettlementSectionProps {
  summary: TripSettlementSummary;
}

function partyLabel(type: "member" | "group", isGuest: boolean): string {
  if (type === "group") return "grup";
  if (isGuest) return "guest";
  return "member";
}

export function SettlementSection({ summary }: SettlementSectionProps): JSX.Element {
  const { currency, totalExpense, totalSettlement, transactions } = summary;
  const hasExpense = totalExpense > 0;
  const hasTransactions = transactions.length > 0;

  return (
    <section className="border-border bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">Pelunasan</h2>
          <span className="text-muted-foreground text-sm">
            {hasTransactions
              ? `${transactions.length} transaksi disarankan`
              : "Tidak ada transaksi"}
          </span>
        </div>
        <span className="text-muted-foreground text-sm">
          Total {formatMoney(totalSettlement, currency)}
        </span>
      </div>

      {!hasExpense ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Belum ada pengeluaran. Rekomendasi pelunasan akan muncul setelah saldo terbentuk.
        </p>
      ) : !hasTransactions ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Semua sudah impas, tidak ada yang perlu dibayar.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {transactions.map((transaction) => (
            <li
              key={`${transaction.from.type}:${transaction.from.refId}-${transaction.to.type}:${transaction.to.refId}-${transaction.amount}`}
              className="border-border flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{transaction.from.displayName}</div>
                  <div className="text-muted-foreground text-xs">
                    {partyLabel(transaction.from.type, transaction.from.isGuest)}
                  </div>
                </div>
                <span className="text-muted-foreground shrink-0 text-sm">→</span>
                <div className="min-w-0">
                  <div className="truncate font-medium">{transaction.to.displayName}</div>
                  <div className="text-muted-foreground text-xs">
                    {partyLabel(transaction.to.type, transaction.to.isGuest)}
                  </div>
                </div>
              </div>
              <span className="text-primary shrink-0 font-semibold">
                {formatMoney(transaction.amount, currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
