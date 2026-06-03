import Link from "next/link";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { TripActionsMenu } from "@/features/trip/components/TripActionsMenu";
import { TripHeader } from "@/features/trip/components/TripHeader";
import { TripInvitePanel } from "@/features/trip/components/TripInvitePanel";
import { getTripById } from "@/features/trip/services/getTripById";
import { TripNotFoundError } from "@/features/trip/services/errors";
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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <Link href="/trips" className="text-muted-foreground text-sm hover:underline">
        ← Kembali
      </Link>

      <TripHeader trip={trip} currentUserRole={role} />

      {isOwner ? <TripActionsMenu trip={trip} /> : null}

      {isOwner ? <TripInvitePanel trip={trip} /> : null}

      <section className="border-border bg-card rounded-xl border p-6">
        <h2 className="text-base font-semibold">Pengeluaran</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Fitur pengeluaran akan tersedia di iterasi berikutnya.
        </p>
      </section>
    </main>
  );
}
