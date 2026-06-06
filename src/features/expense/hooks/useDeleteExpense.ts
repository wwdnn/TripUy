"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteExpenseRequest } from "@/lib/api/expense/deleteExpense";

export interface UseDeleteExpenseResult {
  deleteExpense: (expenseId: string) => Promise<boolean>;
  isPending: boolean;
  error: string | null;
}




export function useDeleteExpense(tripId: string): UseDeleteExpenseResult {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, startTransition] = useTransition();

  async function deleteExpense(expenseId: string): Promise<boolean> {
    setError(null);
    setIsSubmitting(true);
    try {
      await deleteExpenseRequest(tripId, expenseId);
      startTransition(() => {
        router.push(`/trips/${tripId}`);
        router.refresh();
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { deleteExpense, isPending: isSubmitting || isTransitioning, error };
}
