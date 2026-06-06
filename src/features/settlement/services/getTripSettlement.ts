import "server-only";
import type { TripSettlementSummary } from "@/types/settlement";
import { getTripBalances } from "@/features/balance/services/getTripBalances";
import { calculateSettlement } from "./calculateSettlement";

export async function getTripSettlement(
  tripId: string,
  userId: string,
): Promise<TripSettlementSummary> {
  const balances = await getTripBalances(tripId, userId);
  const transactions = calculateSettlement(
    balances.units.map((unit) => ({
      refId: unit.refId,
      type: unit.type,
      displayName: unit.displayName,
      isGuest: unit.isGuest,
      balance: unit.balance,
    })),
  );
  const totalSettlement = transactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  return {
    currency: balances.currency,
    totalExpense: balances.totalExpense,
    totalSettlement,
    transactions,
  };
}
