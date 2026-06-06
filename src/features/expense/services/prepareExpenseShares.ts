import "server-only";
import { prisma } from "@/lib/prisma";
import type { SplitInput, SplitType } from "@/types/expense";
import { TripForbiddenError } from "@/features/trip/services/errors";
import { calculateShares } from "./calculateShares";

export interface ExpenseShareData {
  memberId: string | null;
  groupId: string | null;
  amount: number;
  splitValue: number | null;
}

export async function prepareExpenseShares(
  tripId: string,
  splitType: SplitType,
  splits: SplitInput[],
  amount: number,
): Promise<ExpenseShareData[]> {
  const [members, groups] = await Promise.all([
    prisma.tripMember.findMany({ where: { tripId }, select: { id: true } }),
    prisma.memberGroup.findMany({ where: { tripId }, select: { id: true } }),
  ]);
  const memberIds = new Set(members.map((m) => m.id));
  const groupIds = new Set(groups.map((g) => g.id));

  const seen = new Set<string>();
  for (const split of splits) {
    const key = `${split.type}:${split.refId}`;
    if (seen.has(key)) throw new TripForbiddenError("Peserta duplikat tidak diperbolehkan");
    seen.add(key);

    const isValid =
      split.type === "member" ? memberIds.has(split.refId) : groupIds.has(split.refId);
    if (!isValid) throw new TripForbiddenError("Peserta tidak valid");
  }

  return calculateShares(amount, splitType, splits).map((share) => ({
    memberId: share.type === "member" ? share.refId : null,
    groupId: share.type === "group" ? share.refId : null,
    amount: share.amount,
    splitValue: share.splitValue,
  }));
}
