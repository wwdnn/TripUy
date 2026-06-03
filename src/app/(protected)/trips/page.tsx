import Link from "next/link";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { TripList } from "@/features/trip/components/TripList";
import { getTripsByUserId } from "@/features/trip/services/getTripsByUserId";
import { requireSessionUser } from "@/lib/auth/getSessionUser";
import type { TripStatus } from "@/types/trip";

interface TripsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function TripsPage({ searchParams }: TripsPageProps): Promise<JSX.Element> {
  const user = await requireSessionUser();
  const { status: statusParam } = await searchParams;
  const status: TripStatus = statusParam === "ARCHIVED" ? "ARCHIVED" : "ACTIVE";

  const trips = await getTripsByUserId(user.id, { status });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Trip kamu</h1>
        <Button asChild className="h-11">
          <Link href="/trips/new">Buat Trip</Link>
        </Button>
      </header>

      <TripList trips={trips} activeStatus={status} />
    </main>
  );
}
