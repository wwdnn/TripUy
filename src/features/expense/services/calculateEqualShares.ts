export interface MemberShare {
  memberId: string;
  amount: number;
}

export function calculateEqualShares(amount: number, memberIds: string[]): MemberShare[] {
  const count = memberIds.length;
  if (count === 0) return [];

  const base = Math.floor(amount / count);
  const remainder = amount - base * count;

  return memberIds.map((memberId, index) => ({
    memberId,
    amount: index < remainder ? base + 1 : base,
  }));
}
