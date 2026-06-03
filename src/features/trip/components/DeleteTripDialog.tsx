"use client";

import { AlertDialog } from "radix-ui";
import { useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteTrip } from "@/features/trip/hooks/useDeleteTrip";
import type { Trip } from "@/types/trip";




interface DeleteTripDialogProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}




export function DeleteTripDialog({ trip, open, onOpenChange }: DeleteTripDialogProps): JSX.Element {
  const { deleteTrip, isPending, error } = useDeleteTrip();
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText.trim() === trip.name;

  async function confirm(): Promise<void> {
    if (!canDelete) return;
    const success = await deleteTrip(trip.id);
    if (success) onOpenChange(false);
  }

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) setConfirmText("");
        onOpenChange(next);
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <AlertDialog.Content className="bg-background border-border fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-lg">
          <AlertDialog.Title className="text-lg font-semibold">Hapus trip ini?</AlertDialog.Title>
          <AlertDialog.Description className="text-muted-foreground mt-2 text-sm">
            Tindakan ini tidak bisa dibatalkan. Semua data trip akan hilang permanen.
          </AlertDialog.Description>

          <div className="mt-4 flex flex-col gap-2">
            <Label htmlFor="confirm-name">
              Ketik <span className="font-semibold">{trip.name}</span> untuk konfirmasi
            </Label>
            <Input
              id="confirm-name"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isPending}
            />
          </div>

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
              variant="destructive"
              className="h-11"
              disabled={!canDelete || isPending}
              onClick={() => {
                void confirm();
              }}
            >
              {isPending ? "Menghapus..." : "Hapus Trip"}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
