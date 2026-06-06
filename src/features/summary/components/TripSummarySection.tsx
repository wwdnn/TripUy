import type { JSX } from "react";
import { categoryLabel } from "@/features/expense/categories";
import { formatDate, formatMoney } from "@/lib/utils";
import type { SplitType } from "@/types/expense";
import type { TripSummary } from "@/types/summary";

interface TripSummarySectionProps {
  summary: TripSummary;
}

const splitTypeLabels: Record<SplitType, string> = {
  EQUAL: "Rata",
  EXACT: "Nominal",
  PERCENTAGE: "Persen",
  SHARE: "Share",
};

function formatDateRange(start: Date, end: Date | null): string {
  if (!end) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function TripSummarySection({ summary }: TripSummarySectionProps): JSX.Element {
  const hasExpense = summary.expenseCount > 0;
  const isArchived = summary.tripStatus === "ARCHIVED";
  const splitSummary = summary.splitTypes
    .filter((split) => split.expenseCount > 0)
    .map((split) => `${splitTypeLabels[split.splitType]} ${split.expenseCount}`)
    .join(", ");

  return (
    <section className="border-border bg-card rounded-xl border p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Ringkasan Trip</h2>
        <p className="text-muted-foreground text-sm">
          {isArchived ? "Trip sudah diarsipkan" : "Snapshot pengeluaran dan saldo terkini"}
        </p>
      </div>

      <div className="border-border mt-4 grid overflow-hidden rounded-lg border sm:grid-cols-2">
        <div className="border-border border-b p-3 sm:border-r">
          <p className="text-muted-foreground text-xs">Total pengeluaran</p>
          <p className="mt-1 text-lg font-semibold">
            {formatMoney(summary.totalExpense, summary.currency)}
          </p>
        </div>
        <div className="border-border border-b p-3">
          <p className="text-muted-foreground text-xs">Transaksi</p>
          <p className="mt-1 text-lg font-semibold">{summary.expenseCount}</p>
        </div>
        <div className="border-border border-b p-3 sm:border-r sm:border-b-0">
          <p className="text-muted-foreground text-xs">Member & grup</p>
          <p className="mt-1 text-lg font-semibold">
            {summary.memberCount} member
            {summary.groupCount > 0 ? `, ${summary.groupCount} grup` : ""}
          </p>
        </div>
        <div className="p-3">
          <p className="text-muted-foreground text-xs">Perlu pelunasan</p>
          <p className="mt-1 text-lg font-semibold">
            {formatMoney(summary.balanceOverview.totalSettlement, summary.currency)}
          </p>
        </div>
      </div>

      {!hasExpense ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Belum ada pengeluaran. Ringkasan kategori dan pelunasan akan muncul setelah expense
          pertama dicatat.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs">Jadwal trip</p>
              <p className="mt-1 font-medium">
                {formatDateRange(summary.tripDateRange.startDate, summary.tripDateRange.endDate)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Aktivitas expense</p>
              <p className="mt-1 font-medium">
                {summary.activityDateRange
                  ? formatDateRange(
                      summary.activityDateRange.startDate,
                      summary.activityDateRange.endDate,
                    )
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Kategori terbesar</p>
              <p className="mt-1 font-medium">
                {summary.topCategory
                  ? `${categoryLabel(summary.topCategory.category)} (${formatMoney(
                      summary.topCategory.totalAmount,
                      summary.currency,
                    )})`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Rata-rata</p>
              <p className="mt-1 font-medium">
                {formatMoney(summary.averageExpenseAmount, summary.currency)} / transaksi
              </p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-xs">Expense terakhir</p>
            <p className="mt-1 text-sm font-medium">
              {summary.latestExpense
                ? `${summary.latestExpense.title} - ${formatMoney(
                    summary.latestExpense.amount,
                    summary.currency,
                  )} - ${formatDate(summary.latestExpense.date)}`
                : "-"}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">Kategori</h3>
              <span className="text-muted-foreground text-xs">
                {formatMoney(summary.averagePerMember, summary.currency)} / member rata-rata kasar
              </span>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {summary.categories.slice(0, 4).map((category) => (
                <li key={category.category} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span>{categoryLabel(category.category)}</span>
                    <span className="font-medium">
                      {formatMoney(category.totalAmount, summary.currency)}
                    </span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <span>
              Saldo: {summary.balanceOverview.creditorCount} menerima,{" "}
              {summary.balanceOverview.debtorCount} membayar, {summary.balanceOverview.settledCount}{" "}
              impas
            </span>
            <span>Pelunasan: {summary.balanceOverview.settlementTransactionCount} transaksi</span>
            <span>Split: {splitSummary || "-"}</span>
          </div>
        </div>
      )}
    </section>
  );
}
