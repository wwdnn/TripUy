"use client";

import Link from "next/link";
import { useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/types/trip";
import { ArchiveTripDialog } from "./ArchiveTripDialog";
import { DeleteTripDialog } from "./DeleteTripDialog";



interface TripActionsMenuProps {
  trip: Trip;
}



export function TripActionsMenu({ trip }: TripActionsMenuProps): JSX.Element {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isArchived = trip.status === "ARCHIVED";

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="h-11">
          <Link href={`/trips/${trip.id}/edit`}>Edit</Link>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => setArchiveOpen(true)}
        >
          {isArchived ? "Aktifkan" : "Arsipkan"}
        </Button>
        
        <Button
          type="button"
          variant="destructive"
          className="h-11"
          onClick={() => setDeleteOpen(true)}
        >
          Hapus
        </Button>
      </div>

      <ArchiveTripDialog trip={trip} open={archiveOpen} onOpenChange={setArchiveOpen} />
      <DeleteTripDialog trip={trip} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}
