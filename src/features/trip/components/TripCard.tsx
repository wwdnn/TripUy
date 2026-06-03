import Link from "next/link";
import type { JSX } from "react";
import type { TripListItem } from "@/types/trip";
import { TripStatusBadge } from "./TripStatusBadge";

interface TripCardProps {
  trip: TripListItem;
}




function formatDateRange(start: Date, end: Date | null): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };

  const startStr = new Date(start).toLocaleDateString("id-ID", opts);
  if (!end) return startStr;
  const endStr = new Date(end).toLocaleDateString("id-ID", opts);

  return `${startStr} – ${endStr}`;
}





export function TripCard({ trip }: TripCardProps): JSX.Element {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="border-border bg-card hover:bg-accent block rounded-xl border p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-tight">{trip.name}</h3>
        <TripStatusBadge status={trip.status} />
      </div>

      <p className="text-muted-foreground mt-1 text-sm">
        {formatDateRange(trip.startDate, trip.endDate)}
      </p>
      
      <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
        <span>{trip.memberCount} anggota</span>
        <span>•</span>
        <span>{trip.currency}</span>
        {trip.currentUserRole === "OWNER" ? (
          <>
            <span>•</span>
            <span>Pemilik</span>
          </>
        ) : null}
      </div>
    </Link>
  );
}
