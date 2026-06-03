import type { JSX } from "react";
import type { TripRole, TripWithMembers } from "@/types/trip";
import { TripStatusBadge } from "./TripStatusBadge";

interface TripHeaderProps {
  trip: TripWithMembers;
  currentUserRole: TripRole;
}

function formatDateRange(start: Date | string, end: Date | string | null): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const startStr = new Date(start).toLocaleDateString("id-ID", opts);
  if (!end) return startStr;
  const endStr = new Date(end).toLocaleDateString("id-ID", opts);
  return `${startStr} – ${endStr}`;
}

export function TripHeader({ trip, currentUserRole }: TripHeaderProps): JSX.Element {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">{trip.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        </div>
        <TripStatusBadge status={trip.status} />
      </div>

      {trip.description ? (
        <p className="text-foreground/80 text-sm">{trip.description}</p>
      ) : null}

      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
        <span>{trip.members.length} anggota</span>
        <span>•</span>
        <span>{trip.currency}</span>
        {currentUserRole === "OWNER" ? (
          <>
            <span>•</span>
            <span>Kode: <span className="font-mono">{trip.inviteCode}</span></span>
          </>
        ) : null}
      </div>
    </header>
  );
}
