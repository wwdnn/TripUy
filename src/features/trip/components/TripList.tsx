import Link from "next/link";
import type { JSX } from "react";
import type { TripListItem, TripStatus } from "@/types/trip";
import { TripCard } from "./TripCard";
import { TripEmptyState } from "./TripEmptyState";

interface TripListProps {
  trips: TripListItem[];
  activeStatus: TripStatus;
}

const TABS: { value: TripStatus; label: string }[] = [
  { value: "ACTIVE", label: "Aktif" },
  { value: "ARCHIVED", label: "Diarsipkan" },
];

export function TripList({ trips, activeStatus }: TripListProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-border bg-card flex gap-1 rounded-lg border p-1">
        {TABS.map((tab) => {
          const active = tab.value === activeStatus;
          return (
            <Link
              key={tab.value}
              href={`/trips?status=${tab.value}`}
              className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {trips.length === 0 ? (
        <TripEmptyState archived={activeStatus === "ARCHIVED"} />
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
