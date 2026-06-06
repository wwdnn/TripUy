import type { ExpenseCategory, SplitType } from "@/types/expense";
import type { TripStatus } from "@/types/trip";

export interface CategorySummary {
  category: ExpenseCategory;
  totalAmount: number;
  expenseCount: number;
  percentage: number;
}

export interface SplitTypeSummary {
  splitType: SplitType;
  expenseCount: number;
}

export interface TripSummaryLatestExpense {
  id: string;
  title: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
}

export interface TripSummary {
  currency: string;
  tripStatus: TripStatus;
  totalExpense: number;
  expenseCount: number;
  memberCount: number;
  groupCount: number;
  averageExpenseAmount: number;
  averagePerMember: number;
  tripDateRange: {
    startDate: Date;
    endDate: Date | null;
  };
  activityDateRange: {
    startDate: Date;
    endDate: Date;
  } | null;
  categories: CategorySummary[];
  topCategory: CategorySummary | null;
  splitTypes: SplitTypeSummary[];
  latestExpense: TripSummaryLatestExpense | null;
  balanceOverview: {
    creditorCount: number;
    debtorCount: number;
    settledCount: number;
    settlementTransactionCount: number;
    totalSettlement: number;
  };
}
