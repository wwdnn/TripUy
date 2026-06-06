import Link from "next/link";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { TripActionsMenu } from "@/features/trip/components/TripActionsMenu";
import { TripHeader } from "@/features/trip/components/TripHeader";
import { TripInvitePanel } from "@/features/trip/components/TripInvitePanel";
import { getTripById } from "@/features/trip/services/getTripById";
import { TripNotFoundError } from "@/features/trip/services/errors";
import { ExpenseSection } from "@/features/expense/components/ExpenseSection";
import { getExpensesByTripId } from "@/features/expense/services/getExpensesByTripId";
import { GroupSection } from "@/features/group/components/GroupSection";
import { getTripGroups } from "@/features/group/services/getTripGroups";
import { BalanceSection } from "@/features/balance/components/BalanceSection";
import { getTripBalances } from "@/features/balance/services/getTripBalances";
import { requireSessionUser } from "@/lib/auth/getSessionUser";

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}





export default async function TripDetailPage({ params }: TripDetailPageProps): Promise<JSX.Element> {
  const user = await requireSessionUser();
  const { id } = await params;

  const trip = await getTripById(id, user.id).catch((error) => {
    if (error instanceof TripNotFoundError) notFound();
    throw error;
  });

  const currentMember = trip.members.find((m) => m.userId === user.id);
  const role = currentMember?.role ?? "MEMBER";
  const isOwner = role === "OWNER";

  const expenses = await getExpensesByTripId(id, user.id);
  const groupData = await getTripGroups(id, user.id);
  const balances = await getTripBalances(id, user.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <Link href="/trips" className="text-muted-foreground text-sm hover:underline">
        ← Kembali
      </Link>

      <TripHeader trip={trip} currentUserRole={role} />

      {isOwner ? <TripActionsMenu trip={trip} /> : null}

      {isOwner ? <TripInvitePanel trip={trip} /> : null}

      <GroupSection tripId={trip.id} data={groupData} />

      <ExpenseSection tripId={trip.id} expenses={expenses} />

      <BalanceSection summary={balances} />
    </main>
  );
}
