export interface SettlementParty {
  refId: string;
  type: "member" | "group";
  displayName: string;
  isGuest: boolean;
}

export interface SettlementTransaction {
  from: SettlementParty;
  to: SettlementParty;
  amount: number;
}

export interface TripSettlementSummary {
  currency: string;
  totalExpense: number;
  totalSettlement: number;
  transactions: SettlementTransaction[];
}
