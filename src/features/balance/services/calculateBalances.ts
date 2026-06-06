import type { BalanceUnit } from "@/types/balance";

interface BalanceMember {
  id: string;
  displayName: string;
  isGuest: boolean;
  groupId: string | null;
}

interface BalanceGroup {
  id: string;
  name: string;
}

interface BalanceShare {
  amount: number;
  memberId: string | null;
  groupId: string | null;
}

interface BalanceExpense {
  amount: number;
  paidById: string;
  shares: BalanceShare[];
}

export function calculateBalances(
  members: BalanceMember[],
  groups: BalanceGroup[],
  expenses: BalanceExpense[],
): BalanceUnit[] {
  const groupById = new Map(groups.map((g) => [g.id, g]));
  const units = new Map<string, BalanceUnit>();
  const memberToUnitKey = new Map<string, string>();

  for (const member of members) {
    if (member.groupId && groupById.has(member.groupId)) {
      const key = `group:${member.groupId}`;
      memberToUnitKey.set(member.id, key);
      if (!units.has(key)) {
        const group = groupById.get(member.groupId)!;
        units.set(key, {
          type: "group",
          refId: group.id,
          displayName: group.name,
          isGuest: false,
          memberIds: [],
          paid: 0,
          owed: 0,
          balance: 0,
        });
      }
      units.get(key)!.memberIds.push(member.id);
    } else {
      const key = `member:${member.id}`;
      memberToUnitKey.set(member.id, key);
      units.set(key, {
        type: "member",
        refId: member.id,
        displayName: member.displayName,
        isGuest: member.isGuest,
        memberIds: [member.id],
        paid: 0,
        owed: 0,
        balance: 0,
      });
    }
  }

  const resolveShareUnitKey = (share: BalanceShare): string | null => {
    if (share.groupId) {
      const key = `group:${share.groupId}`;
      return units.has(key) ? key : null;
    }
    if (share.memberId) {
      return memberToUnitKey.get(share.memberId) ?? null;
    }
    return null;
  };

  for (const expense of expenses) {
    const payerKey = memberToUnitKey.get(expense.paidById);
    if (payerKey) {
      units.get(payerKey)!.paid += expense.amount;
    }
    for (const share of expense.shares) {
      const key = resolveShareUnitKey(share);
      if (key) {
        units.get(key)!.owed += share.amount;
      }
    }
  }

  return [...units.values()]
    .map((u) => ({ ...u, balance: u.paid - u.owed }))
    .sort((a, b) => b.balance - a.balance || a.displayName.localeCompare(b.displayName));
}
