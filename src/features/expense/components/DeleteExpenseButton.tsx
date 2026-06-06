"use client";

import { AlertDialog } from "radix-ui";
import { useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { useDeleteExpense } from "@/features/expense/hooks/useDeleteExpense";

interface DeleteExpenseButtonProps {
  tripId: string;
  expenseId: string;
}

export function DeleteExpenseButton({ tripId, expenseId }: DeleteExpenseButtonProps): JSX.Element {
  const { deleteExpense, isPending, error } = useDeleteExpense(tripId);
  const [open, setOpen] = useState(false);

  async function confirm(): Promise<void> {
    const success = await deleteExpense(expenseId);
    if (success) setOpen(false);
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <Button type="button" variant="outline" className="h-11">
          Hapus
        </Button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <AlertDialog.Content className="bg-background border-border fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-lg">

          <AlertDialog.Title className="text-lg font-semibold">
            Hapus pengeluaran ini?
          </AlertDialog.Title>
          
          <AlertDialog.Description className="text-muted-foreground mt-2 text-sm">
            Tindakan ini tidak bisa dibatalkan.
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
              variant="destructive"
              className="h-11"
              disabled={isPending}
              onClick={() => { void confirm(); }}
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
