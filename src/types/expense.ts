export type ExpenseCategory =
  | "FOOD"
  | "TRANSPORT"
  | "LODGING"
  | "ACTIVITY"
  | "SHOPPING"
  | "OTHER";

export interface ExpenseShare {
  id: string;
  expenseId: string;
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: string;
  date: Date;
  category: ExpenseCategory;
  note: string | null;
  paidById: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseShareWithName extends ExpenseShare {
  memberName: string;
}

export interface ExpenseDetail extends Expense {
  paidByName: string;
  shares: ExpenseShareWithName[];
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

export interface ExpenseFormContext {
  tripId: string;
  currency: string;
  members: ExpenseMemberOption[];
  currentMemberId: string;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  note?: string;
  paidById: string;
  participantIds: string[];
}

export type UpdateExpenseInput = CreateExpenseInput;
