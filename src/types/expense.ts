export type ExpenseCategory =
  | "FOOD"
  | "TRANSPORT"
  | "LODGING"
  | "ACTIVITY"
  | "SHOPPING"
  | "OTHER";

export type SplitType = "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARE";

export type SplitUnitType = "member" | "group";

export interface SplitInput {
  type: SplitUnitType;
  refId: string;
  value?: number;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: string;
  date: Date;
  category: ExpenseCategory;
  splitType: SplitType;
  note: string | null;
  paidById: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseShareUnit {
  id: string;
  type: SplitUnitType;
  refId: string;
  name: string;
  amount: number;
  splitValue: number | null;
}

export interface ExpenseDetail extends Expense {
  paidByName: string;
  shares: ExpenseShareUnit[];
  canEdit: boolean;
}

export interface ExpenseListItem extends Expense {
  paidByName: string;
  participantCount: number;
}

export interface ExpenseMemberOption {
  id: string;
  name: string;
}

export interface ExpenseUnitOption {
  type: SplitUnitType;
  refId: string;
  name: string;
}

export interface ExpenseFormContext {
  tripId: string;
  currency: string;
  members: ExpenseMemberOption[];
  units: ExpenseUnitOption[];
  currentMemberId: string;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  note?: string;
  paidById: string;
  splitType: SplitType;
  splits: SplitInput[];
}

export type UpdateExpenseInput = CreateExpenseInput;
