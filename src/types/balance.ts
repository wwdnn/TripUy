export interface BalanceUnit {
  type: "member" | "group";
  refId: string;
  displayName: string;
  isGuest: boolean;
  memberIds: string[];
  paid: number;
  owed: number;
  balance: number;
}

export interface TripBalanceSummary {
  currency: string;
  totalExpense: number;
  units: BalanceUnit[];
}
