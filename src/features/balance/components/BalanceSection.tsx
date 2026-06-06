import type { JSX } from "react";
import { cn, formatMoney } from "@/lib/utils";
import type { TripBalanceSummary } from "@/types/balance";

interface BalanceSectionProps {
  summary: TripBalanceSummary;
}

function balanceLabel(balance: number): string {
  if (balance > 0) return "Menerima";
  if (balance < 0) return "Membayar";
  return "Impas";
}

export function BalanceSection({ summary }: BalanceSectionProps): JSX.Element {
  const { currency, totalExpense, units } = summary;
  const hasExpense = totalExpense > 0;

  return (
    <section className="border-border bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Saldo</h2>
        <span className="text-muted-foreground text-sm">
          Total {formatMoney(totalExpense, currency)}
        </span>
      </div>

      {!hasExpense ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Belum ada pengeluaran. Saldo akan muncul setelah ada pengeluaran.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {units.map((unit) => (
            <li
              key={`${unit.type}:${unit.refId}`}
              className="border-border flex items-center justify-between gap-2 rounded-lg border p-3"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">
                  {unit.displayName}
                  {unit.type === "group" ? (
                    <span className="text-muted-foreground ml-1 text-xs">(grup)</span>
                  ) : null}
                </span>
                <span className="text-muted-foreground text-xs">
                  Bayar {formatMoney(unit.paid, currency)} • Tanggungan{" "}
                  {formatMoney(unit.owed, currency)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span
                  className={cn(
                    "font-semibold",
                    unit.balance > 0 && "text-emerald-600 dark:text-emerald-400",
                    unit.balance < 0 && "text-red-600 dark:text-red-400",
                  )}
                >
                  {formatMoney(Math.abs(unit.balance), currency)}
                </span>
                <span className="text-muted-foreground text-xs">{balanceLabel(unit.balance)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
