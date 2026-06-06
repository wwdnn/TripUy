import Link from "next/link";
import { notFound } from "next/navigation";
import type { JSX } from "react";
import { GroupManager } from "@/features/group/components/GroupManager";
import { getTripGroups } from "@/features/group/services/getTripGroups";
import { TripNotFoundError } from "@/features/trip/services/errors";
import { requireSessionUser } from "@/lib/auth/getSessionUser";

interface GroupsPageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupsPage({ params }: GroupsPageProps): Promise<JSX.Element> {
  const user = await requireSessionUser();
  const { id } = await params;

  const data = await getTripGroups(id, user.id).catch((error) => {
    if (error instanceof TripNotFoundError) notFound();
    throw error;
  });

  if (!data.isOwner) notFound();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <Link href={`/trips/${id}`} className="text-muted-foreground text-sm hover:underline">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-semibold">Kelola Grup</h1>
        <p className="text-muted-foreground text-sm">
          Kelompokkan member menjadi satu unit pembayaran patungan.
        </p>
      </header>

      <GroupManager tripId={id} data={data} />
    </main>
  );
}
