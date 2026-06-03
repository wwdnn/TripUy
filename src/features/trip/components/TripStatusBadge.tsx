import type { JSX } from "react";
import type { TripStatus } from "@/types/trip";

interface TripStatusBadgeProps {
  status: TripStatus;
}

export function TripStatusBadge({ status }: TripStatusBadgeProps): JSX.Element {
  const label = status === "ACTIVE" ? "Aktif" : "Diarsipkan";
  const className =
    status === "ACTIVE"
      ? "bg-primary/10 text-primary"
      : "bg-muted text-muted-foreground";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
