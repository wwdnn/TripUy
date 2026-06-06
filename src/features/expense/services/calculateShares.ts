import type { SplitInput, SplitType, SplitUnitType } from "@/types/expense";

export interface ComputedShare {
  type: SplitUnitType;
  refId: string;
  amount: number;
  splitValue: number | null;
}

function distributeProportional(amount: number, splits: SplitInput[]): ComputedShare[] {
  const weights = splits.map((s) => s.value ?? 0);
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);

  if (totalWeight <= 0) {
    return splits.map((s) => ({ type: s.type, refId: s.refId, amount: 0, splitValue: s.value ?? 0 }));
  }

  const raw = splits.map((s, index) => {
    const exact = (amount * weights[index]) / totalWeight;
    const floor = Math.floor(exact);
    return { index, floor, frac: exact - floor };
  });

  const allocated = raw.reduce((acc, r) => acc + r.floor, 0);
  let remainder = amount - allocated;

  const bonus = new Set<number>();
  const byLargestFrac = [...raw].sort((a, b) => b.frac - a.frac || a.index - b.index);
  for (const r of byLargestFrac) {
    if (remainder <= 0) break;
    bonus.add(r.index);
    remainder -= 1;
  }

  return splits.map((s, index) => ({
    type: s.type,
    refId: s.refId,
    amount: raw[index].floor + (bonus.has(index) ? 1 : 0),
    splitValue: s.value ?? 0,
  }));
}






export function calculateShares(
  amount: number,
  splitType: SplitType,
  splits: SplitInput[],
): ComputedShare[] {
  if (splits.length === 0) return [];

  if (splitType === "EXACT") {
    return splits.map((s) => ({
      type: s.type,
      refId: s.refId,
      amount: s.value ?? 0,
      splitValue: s.value ?? 0,
    }));
  }

  if (splitType === "PERCENTAGE" || splitType === "SHARE") {
    return distributeProportional(amount, splits);
  }

  const count = splits.length;
  const base = Math.floor(amount / count);
  const remainder = amount - base * count;

  return splits.map((s, index) => ({
    type: s.type,
    refId: s.refId,
    amount: index < remainder ? base + 1 : base,
    splitValue: null,
  }));
}
