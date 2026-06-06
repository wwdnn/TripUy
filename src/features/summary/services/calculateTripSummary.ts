import type { ExpenseCategory, SplitType } from "@/types/expense";
import type { TripStatus } from "@/types/trip";
import type { TripBalanceSummary } from "@/types/balance";
import type { TripSettlementSummary } from "@/types/settlement";
import type { CategorySummary, SplitTypeSummary, TripSummary } from "@/types/summary";

interface TripSummaryTripLite {
  currency: string;
  status: TripStatus;
  startDate: Date;
  endDate: Date | null;
}

interface TripSummaryExpenseLite {
  id: string;
  title: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  splitType: SplitType;
}

interface CalculateTripSummaryInput {
  trip: TripSummaryTripLite;
  memberCount: number;
  groupCount: number;
  expenses: TripSummaryExpenseLite[];
  balances: TripBalanceSummary;
  settlement: TripSettlementSummary;
}

const SPLIT_TYPES: SplitType[] = ["EQUAL", "EXACT", "PERCENTAGE", "SHARE"];

export function calculateTripSummary({
  trip,
  memberCount,
  groupCount,
  expenses,
  balances,
  settlement,
}: CalculateTripSummaryInput): TripSummary {
  const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);
  const expenseCount = expenses.length;
  const averageExpenseAmount = expenseCount > 0 ? Math.round(totalExpense / expenseCount) : 0;
  const averagePerMember = memberCount > 0 ? Math.round(totalExpense / memberCount) : 0;

  const categoryMap = new Map<ExpenseCategory, CategorySummary>();
  const splitTypeCount = new Map<SplitType, number>();

  for (const expense of expenses) {
    const currentCategory = categoryMap.get(expense.category) ?? {
      category: expense.category,
      totalAmount: 0,
      expenseCount: 0,
      percentage: 0,
    };

    currentCategory.totalAmount += expense.amount;
    currentCategory.expenseCount += 1;
    categoryMap.set(expense.category, currentCategory);
    splitTypeCount.set(expense.splitType, (splitTypeCount.get(expense.splitType) ?? 0) + 1);
  }

  const categories = Array.from(categoryMap.values())
    .map((category) => ({
      ...category,
      percentage: totalExpense > 0 ? (category.totalAmount / totalExpense) * 100 : 0,
    }))
    .sort(
      (a, b) =>
        b.totalAmount - a.totalAmount ||
        b.expenseCount - a.expenseCount ||
        a.category.localeCompare(b.category),
    );

  const splitTypes: SplitTypeSummary[] = SPLIT_TYPES.map((splitType) => ({
    splitType,
    expenseCount: splitTypeCount.get(splitType) ?? 0,
  }));

  const latestExpense =
    expenses.length > 0
      ? [...expenses].sort(
          (a, b) => b.date.getTime() - a.date.getTime() || a.title.localeCompare(b.title),
        )[0]
      : null;

  const sortedDates = [...expenses]
    .map((expense) => expense.date)
    .sort((a, b) => a.getTime() - b.getTime());

  return {
    currency: trip.currency,
    tripStatus: trip.status,
    totalExpense,
    expenseCount,
    memberCount,
    groupCount,
    averageExpenseAmount,
    averagePerMember,
    tripDateRange: {
      startDate: trip.startDate,
      endDate: trip.endDate,
    },
    activityDateRange:
      sortedDates.length > 0
        ? {
            startDate: sortedDates[0],
            endDate: sortedDates[sortedDates.length - 1],
          }
        : null,
    categories,
    topCategory: categories[0] ?? null,
    splitTypes,
    latestExpense,
    balanceOverview: {
      creditorCount: balances.units.filter((unit) => unit.balance > 0).length,
      debtorCount: balances.units.filter((unit) => unit.balance < 0).length,
      settledCount: balances.units.filter((unit) => unit.balance === 0).length,
      settlementTransactionCount: settlement.transactions.length,
      totalSettlement: settlement.totalSettlement,
    },
  };
}
