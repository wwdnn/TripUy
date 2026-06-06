import Link from "next/link";
import type { JSX } from "react";
import type { TripGroupData } from "@/types/group";

interface GroupSectionProps {
  tripId: string;
  data: TripGroupData;
}

export function GroupSection({ tripId, data }: GroupSectionProps): JSX.Element {
  const ungrouped = data.members.filter((m) => !m.groupId);

  return (
    <section className="border-border bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Grup Member</h2>
        {data.isOwner ? (
          <Link
            href={`/trips/${tripId}/groups`}
            className="border-border hover:bg-muted flex h-9 items-center rounded-md border px-3 text-sm font-medium"
          >
            Kelola
          </Link>
        ) : null}
      </div>

      {data.groups.length === 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Belum ada grup. Kelompokkan member yang patungan satu dompet menjadi satu unit.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {data.groups.map((group) => (
            <li key={group.id} className="border-border rounded-lg border p-3">
              <p className="font-medium">{group.name}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {group.members.length > 0
                  ? group.members.map((m) => m.name).join(", ")
                  : "Belum ada anggota"}
              </p>
            </li>
          ))}
        </ul>
      )}

      {ungrouped.length > 0 ? (
        <p className="text-muted-foreground mt-3 text-xs">
          Individual: {ungrouped.map((m) => m.name).join(", ")}
        </p>
      ) : null}
    </section>
  );
}
