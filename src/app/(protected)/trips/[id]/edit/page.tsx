import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { JSX } from "react";
import { TripForm } from "@/features/trip/components/TripForm";
import { getTripById } from "@/features/trip/services/getTripById";
import { TripNotFoundError } from "@/features/trip/services/errors";
import { requireSessionUser } from "@/lib/auth/getSessionUser";




interface EditTripPageProps {
  params: Promise<{ id: string }>;
}


export default async function EditTripPage({ params }: EditTripPageProps): Promise<JSX.Element> {
  const user = await requireSessionUser();
  const { id } = await params;

  const trip = await getTripById(id, user.id).catch((error) => {
    if (error instanceof TripNotFoundError) notFound();
    throw error;
  });

  const isOwner = trip.members.some((m) => m.userId === user.id && m.role === "OWNER");
  if (!isOwner) redirect(`/trips/${id}`);


  
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <Link href={`/trips/${id}`} className="text-muted-foreground text-sm hover:underline">
          ← Kembali
        </Link>

        <h1 className="text-2xl font-semibold">Edit trip</h1>
      </header>
      
      <TripForm mode="edit" initialData={trip} />
    </main>
  );
}
