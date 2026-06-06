import type { SettlementParty, SettlementTransaction } from "@/types/settlement";

export interface SettlementUnitLite extends SettlementParty {
  balance: number;
}

interface PendingSettlementParty extends SettlementParty {
  remaining: number;
}

function toParty(unit: SettlementParty): SettlementParty {
  return {
    refId: unit.refId,
    type: unit.type,
    displayName: unit.displayName,
    isGuest: unit.isGuest,
  };
}

function byLargestAmountThenName(
  first: PendingSettlementParty,
  second: PendingSettlementParty,
): number {
  return second.remaining - first.remaining || first.displayName.localeCompare(second.displayName);
}

export function calculateSettlement(units: SettlementUnitLite[]): SettlementTransaction[] {
  const debtors = units
    .filter((unit) => unit.balance < 0)
    .map((unit) => ({ ...toParty(unit), remaining: Math.abs(unit.balance) }))
    .sort(byLargestAmountThenName);

  const creditors = units
    .filter((unit) => unit.balance > 0)
    .map((unit) => ({ ...toParty(unit), remaining: unit.balance }))
    .sort(byLargestAmountThenName);

  const transactions: SettlementTransaction[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.remaining, creditor.remaining);

    if (amount > 0 && debtor.refId !== creditor.refId) {
      transactions.push({
        from: toParty(debtor),
        to: toParty(creditor),
        amount,
      });
    }

    debtor.remaining -= amount;
    creditor.remaining -= amount;

    if (debtor.remaining === 0) debtorIndex += 1;
    if (creditor.remaining === 0) creditorIndex += 1;
  }

  return transactions.sort(
    (first, second) =>
      second.amount - first.amount ||
      first.from.displayName.localeCompare(second.from.displayName) ||
      first.to.displayName.localeCompare(second.to.displayName),
  );
}
