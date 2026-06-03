"use client";

import { AlertDialog } from "radix-ui";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { useArchiveTrip } from "@/features/trip/hooks/useArchiveTrip";
import type { Trip } from "@/types/trip";

interface ArchiveTripDialogProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}






export function ArchiveTripDialog({ trip, open, onOpenChange }: ArchiveTripDialogProps): JSX.Element {
  const { archiveTrip, isPending, error } = useArchiveTrip();
  const isArchived = trip.status === "ARCHIVED";
  const nextStatus = isArchived ? "ACTIVE" : "ARCHIVED";
  const title = isArchived ? "Aktifkan trip ini?" : "Arsipkan trip ini?";
  const description = isArchived
    ? "Trip akan kembali muncul di daftar trip aktif."
    : "Trip akan dipindahkan ke daftar trip diarsipkan dan bisa diaktifkan kembali kapan saja.";

  async function confirm(): Promise<void> {
    const result = await archiveTrip(trip.id, nextStatus);
    if (result) onOpenChange(false);
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <AlertDialog.Content className="bg-background border-border fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-lg">
          <AlertDialog.Title className="text-lg font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="text-muted-foreground mt-2 text-sm">
            {description}
          </AlertDialog.Description>

          {error ? (
            <p className="text-destructive bg-destructive/10 mt-3 rounded-md p-3 text-sm" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button type="button" variant="outline" className="h-11" disabled={isPending}>
                Batal
              </Button>
            </AlertDialog.Cancel>
            <Button
              type="button"
              className="h-11"
              disabled={isPending}
              onClick={() => {
                void confirm();
              }}
            >
              {isPending ? "Memproses..." : isArchived ? "Aktifkan" : "Arsipkan"}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
